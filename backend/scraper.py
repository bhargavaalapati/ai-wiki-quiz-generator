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
        response.raise_for_status()

        soup = BeautifulSoup(response.content, "html.parser")

        # 1. Extract Title
        title_tag = soup.find(id="firstHeading")
        title = title_tag.get_text() if title_tag else "Unknown Title"

        # 2. Extract Main Content
        content_div = soup.find(id="mw-content-text")
        if not content_div:
            raise ValueError("Could not find main content div '#mw-content-text'")

        # 3. Clean Content (Aggressive Token Saving)
        for tag in content_div.find_all(
            [
                "sup",
                "table",
                "style",
                "script",
                "nav",  # New: Remove navigation
                "footer",  # New: Remove footers
                "aside",  # New: Remove sidebars/infoboxes
                ".mw-editsection",
                ".reference",
                ".reflist",
                ".mw-parser-output > div",  # New: often contains metadata/infoboxes
            ]
        ):
            tag.decompose()

        clean_text = f"Article Title: {title}\n\n"

        # Extract text from specific tags only to avoid clutter
        for element in content_div.find_all(["p", "h2", "h3", "ul", "ol"]):
            text = element.get_text(strip=True)
            if not text:
                continue  # Skip empty elements

            if element.name == "h2":
                clean_text += f"\n## {text} ##\n"
            elif element.name == "h3":
                clean_text += f"\n### {text} ###\n"
            elif element.name in ["ul", "ol"]:
                for li in element.find_all("li"):
                    li_text = li.get_text(strip=True)
                    if li_text:
                        clean_text += f"* {li_text}\n"
            else:
                clean_text += text + "\n\n"

        # --- TOKEN SAVER: Limit to 12,000 chars (~3,000 tokens) ---
        max_chars = 12000
        if len(clean_text) > max_chars:
            clean_text = (
                clean_text[:max_chars] + "\n\n... [Truncated for AI Token Limit]"
            )

        return title, clean_text

    except Exception as e:
        print(f"Error processing page: {e}")
        raise
