import requests
from bs4 import BeautifulSoup


def scrape_wikipedia(url: str) -> (str, str):
    """
    Scrapes a Wikipedia URL, extracts the title and clean article text.
    Returns (title, clean_text)
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)

        soup = BeautifulSoup(response.content, "html.parser")

        # 1. Extract Title
        title = soup.find(id="firstHeading").get_text()

        # 2. Extract Main Content
        content_div = soup.find(id="mw-content-text")
        if not content_div:
            raise ValueError("Could not find main content div '#mw-content-text'")

        # 3. Clean Content
        # Remove elements that are not part of the main article
        for tag in content_div.find_all(
            [
                "sup",
                "table",
                ".mw-editsection",
                ".reference",
                ".reflist",
                "style",
                "script",
            ]
        ):
            tag.decompose()

        # Get all paragraphs
        paragraphs = content_div.find_all("p", recursive=False)  # Only direct children

        # For a cleaner text, let's also grab list items and headings
        # We'll just concatenate all text for the LLM
        clean_text = f"Article Title: {title}\n\n"

        for element in content_div.find_all(["p", "h2", "h3", "ul", "ol"]):
            if element.name == "h2":
                clean_text += f"\n## {element.get_text(strip=True)} ##\n"
            elif element.name == "h3":
                clean_text += f"\n### {element.get_text(strip=True)} ###\n"
            elif element.name in ["ul", "ol"]:
                for li in element.find_all("li"):
                    clean_text += f"* {li.get_text(strip=True)}\n"
            else:
                clean_text += element.get_text(strip=True) + "\n\n"

        # Limit text size to avoid huge LLM context
        # ~15k chars is a safe bet for free tiers
        max_chars = 15000
        if len(clean_text) > max_chars:
            clean_text = (
                clean_text[:max_chars] + "\n\n... [Article truncated for brevity]"
            )

        return title, clean_text

    except requests.exceptions.RequestException as e:
        print(f"Network error scraping {url}: {e}")
        raise
    except Exception as e:
        print(f"Error processing page: {e}")
        raise
