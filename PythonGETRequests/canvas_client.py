import os, requests

BASE = "https://colostate.instructure.com"
TOKEN = "3716~t8TPNnMunC3uvNRL7DuCDEDDn7aXEcAemzLJhKUx9RGLEGBQ29RXzB6RA4e3f6aT"

_session = None
def session():
    global _session
    if _session is None:
        if not TOKEN:
            raise RuntimeError("Set CANVAS_TOKEN canvas_client.pyr")
        _session = requests.Session()
        _session.headers["Authorization"] = f"Bearer {TOKEN}"
    return _session

def list_my_courses(enrollment_state="active", per_page=100):
    url = f"{BASE}/api/v1/users/self/courses?enrollment_state={enrollment_state}&per_page={per_page}"
    s = session()
    out = []
    while url:
        r = s.get(url); r.raise_for_status()
        out += r.json()
        link = r.headers.get("Link","")
        next_part = next((p for p in link.split(",") if 'rel="next"' in p), None)
        url = next_part.split(";")[0].strip()[1:-1] if next_part else None
    return out

if __name__ == "__main__":
    from pprint import pprint
    pprint(list_my_courses())