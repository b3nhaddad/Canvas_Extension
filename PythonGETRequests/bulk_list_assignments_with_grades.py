from canvas_client import session, BASE, list_my_courses

# ---------- API helpers ----------

def list_assignment_groups(course_id, per_page=100):
    """Return all assignment groups for a given Canvas course."""
    url = f"{BASE}/api/v1/courses/{course_id}/assignment_groups?per_page={per_page}"
    s = session()
    out = []
    while url:
        r = s.get(url, timeout=15)
        r.raise_for_status()
        out += r.json()
        link = r.headers.get("Link", "")
        next_part = next((p for p in link.split(",") if 'rel="next"' in p), None)
        url = next_part.split(";")[0].strip()[1:-1] if next_part else None
    return out


def list_assignments_in_group(course_id, group_id, per_page=100):
    """
    Return all assignments inside a specific assignment group,
    including *your* submission (if any) embedded in each assignment.
    """
    url = (
        f"{BASE}/api/v1/courses/{course_id}/assignment_groups/{group_id}/assignments"
        f"?per_page={per_page}&include[]=submission"
    )
    s = session()
    out = []
    while url:
        r = s.get(url, timeout=15)
        r.raise_for_status()
        out += r.json()
        link = r.headers.get("Link", "")
        next_part = next((p for p in link.split(",") if 'rel="next"' in p), None)
        url = next_part.split(";")[0].strip()[1:-1] if next_part else None
    return out


def get_course_grade(course_id):
    """Return the overall grade for the current user in a course."""
    url = f"{BASE}/api/v1/courses/{course_id}/enrollments?user_id=self"
    s = session()
    r = s.get(url, timeout=15)
    r.raise_for_status()
    data = r.json()
    if not data:
        return None
    grades = data[0].get("grades", {})
    return {
        "current_score": grades.get("current_score"),
        "final_score": grades.get("final_score"),
        "current_grade": grades.get("current_grade"),
        "final_grade": grades.get("final_grade"),
    }


# ---------- Script entrypoint ----------

if __name__ == "__main__":
    for course in list_my_courses():
        course_id = course.get("id")
        name = course.get("name")
        print(f"\n=== {name} ({course_id}) ===")

        # Course-level grade
        course_grade = get_course_grade(course_id)
        if course_grade:
            print(f"  Current Grade: {course_grade.get('current_grade')} ({course_grade.get('current_score')}%)")

        try:
            groups = list_assignment_groups(course_id)
            if not groups:
                print("  No assignment groups found.")
                continue

            for g in groups:
                print(f"\n  ▶ {g['name']} (Weight: {g.get('group_weight', 'N/A')}%)")
                assignments = list_assignments_in_group(course_id, g["id"])
                if not assignments:
                    print("     No assignments found.")
                    continue

                for a in assignments:
                    due = a.get("due_at", "No due date")
                    points = a.get("points_possible", "N/A")

                    # Embedded submission for *current user*
                    sub = a.get("submission") or {}
                    score = sub.get("score", "N/A")
                    submitted = "Yes" if sub.get("submitted_at") else "No"
                    late = " (Late)" if sub.get("late") else ""

                    print(f"     • {a['name']} | Points: {points} | Due: {due}")
                    print(f"       Submitted: {submitted}{late} | Score: {score}")

        except Exception as e:
            print(f"  Error fetching data: {e}")
