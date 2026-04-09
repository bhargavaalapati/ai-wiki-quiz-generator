from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores.pgvector import PGVector
from rank_bm25 import BM25Okapi
from flashrank import Ranker, RerankRequest
from sqlalchemy.orm import Session
from database import SessionLocal, QuizHistory
import os

# 1. Initialize PyTorch-backed Embeddings (Local, Free, Fast)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Database connection
CONNECTION_STRING = os.getenv("DATABASE_URL")


def get_all_topics_from_db():
    """Helper function to get all historical summaries for Keyword Search."""
    db: Session = SessionLocal()
    try:
        # Fetch the 100 most recent quizzes to build our BM25 index
        quizzes = (
            db.query(QuizHistory)
            .filter(QuizHistory.full_quiz_data.isnot(None))
            .order_by(QuizHistory.date_generated.desc())
            .limit(100)
            .all()
        )

        documents = []
        metadata = []
        for q in quizzes:
            data = q.get_full_data()
            if "summary" in data:
                documents.append(data["summary"])
                metadata.append({"topic_title": q.title})

        return documents, metadata
    finally:
        db.close()


def get_hybrid_recommendations(failed_topic: str, context_text: str):
    """
    The Advanced RAG Pipeline: Vector + BM25 + CrossEncoder Re-ranking
    """
    query = f"Prerequisite knowledge for {failed_topic}: {context_text}"

    # --- A. DENSE RETRIEVAL (Semantic Vector Search) ---
    print("--- [RAG] Running Vector Search ---")
    vector_store = PGVector(
        connection_string=CONNECTION_STRING,
        embedding_function=embeddings,
        collection_name="knowledge_base",
    )

    # Get top 5 semantically similar topics
    dense_retriever = vector_store.as_retriever(search_kwargs={"k": 5})
    dense_candidates = dense_retriever.invoke(query)

    # --- B. SPARSE RETRIEVAL (Keyword/BM25 Search) ---
    print("--- [RAG] Running Keyword Search ---")
    documents, metadata = get_all_topics_from_db()
    sparse_candidates = []

    if documents:
        tokenized_corpus = [doc.lower().split(" ") for doc in documents]
        bm25 = BM25Okapi(tokenized_corpus)
        tokenized_query = query.lower().split(" ")

        # Get top 5 keyword matches
        top_n_docs = bm25.get_top_n(tokenized_query, documents, n=5)

        # Format them to match the LangChain Document structure
        for doc_text in top_n_docs:
            idx = documents.index(doc_text)
            sparse_candidates.append(
                {"page_content": doc_text, "metadata": metadata[idx]}
            )

    # Combine candidates and remove duplicates (Union)
    all_candidates = []
    seen_titles = set()

    # Add Dense
    for doc in dense_candidates:
        if doc.metadata.get("topic_title") not in seen_titles:
            all_candidates.append({"text": doc.page_content, "meta": doc.metadata})
            seen_titles.add(doc.metadata.get("topic_title"))

    # Add Sparse
    for doc in sparse_candidates:
        if doc["metadata"].get("topic_title") not in seen_titles:
            all_candidates.append(
                {"text": doc["page_content"], "meta": doc["metadata"]}
            )
            seen_titles.add(doc["metadata"].get("topic_title"))

    # Fallback if the database is totally empty
    if not all_candidates:
        return ["Fundamental Concepts", "Basic Principles"]

    # --- C. POST-RETRIEVAL RE-RANKING ---
    print("--- [RAG] Re-ranking Candidates ---")
    # Using FlashRank's default TinyBERT model (super fast)
    ranker = Ranker(max_length=128)

    # Format passages for FlashRank: [{"id": 1, "text": "...", "meta": {...}}]
    passages = []
    for i, candidate in enumerate(all_candidates):
        candidate["id"] = i
        passages.append(candidate)

    rerankrequest = RerankRequest(
        query=f"Fundamentals of {failed_topic}", passages=passages
    )
    reranked_results = ranker.rerank(rerankrequest)

    # Extract the top 2 recommended topics
    top_recommendations = [
        result["meta"]["topic_title"] for result in reranked_results[:2]
    ]

    print(f"--- [RAG] Recommended Paths: {top_recommendations} ---")
    return top_recommendations


def add_to_knowledge_base(title: str, summary: str):
    """
    Background task: Every time a quiz is generated, add its summary to the Vector DB.
    """
    print(f"--- [RAG Ingestion] Adding '{title}' to Vector DB ---")
    vector_store = PGVector(
        connection_string=CONNECTION_STRING,
        embedding_function=embeddings,
        collection_name="knowledge_base",
    )
    vector_store.add_texts(texts=[summary], metadatas=[{"topic_title": title}])
    print("--- [RAG Ingestion] Complete ---")
