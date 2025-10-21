from canvas_client import session, BASE
from canvas_client import list_my_courses

def list_assignment_groups(course_id, per_page=100):
    """Return all assignment groups for a given Canvas course."""
    url = f"{BASE}/api/v1/courses/{course_id}/assignment_groups?per_page={per_page}"
    s = session()
    out = []
    while url:
        r = s.get(url)
        r.raise_for_status()
        out += r.json()
        link = r.headers.get("Link", "")
        next_part = next((p for p in link.split(",") if 'rel=\"next\"' in p), None)
        url = next_part.split(";")[0].strip()[1:-1] if next_part else None
    return out


def list_assignments_in_group(course_id, group_id, per_page=100):
    """Return all assignments inside a specific assignment group."""
    url = f"{BASE}/api/v1/courses/{course_id}/assignment_groups/{group_id}/assignments?per_page={per_page}"
    s = session()
    out = []
    while url:
        r = s.get(url)
        r.raise_for_status()
        out += r.json()
        link = r.headers.get("Link", "")
        next_part = next((p for p in link.split(",") if 'rel=\"next\"' in p), None)
        url = next_part.split(";")[0].strip()[1:-1] if next_part else None
    return out


if __name__ == "__main__":
    for course in list_my_courses():
        course_id = course.get("id")
        name = course.get("name")
        print(f"\n=== {name} ({course_id}) ===")

        try:
            groups = list_assignment_groups(course_id)
            if not groups:
                print("  No assignment groups found.")
                continue

            for g in groups:
                print(f"\n  ▶ {g['name']} (ID: {g['id']}) | Weight: {g.get('group_weight', 'N/A')}%")
                assignments = list_assignments_in_group(course_id, g['id'])
                if not assignments:
                    print("     No assignments found in this group.")
                    continue

                for a in assignments:
                    due = a.get('due_at', 'No due date')
                    points = a.get('points_possible', 'N/A')
                    print(f"     • {a['name']} | Points: {points} | Due: {due}")

        except Exception as e:
            print(f"  Error fetching data: {e}")
