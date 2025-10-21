from canvas_client import list_my_courses

for c in list_my_courses():
    print(f"{c.get('id')}\t{c.get('course_code')}\t{c.get('name')}")
