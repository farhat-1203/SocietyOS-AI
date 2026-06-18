import json
import os

KB_PATH = "knowledge_base"


def _load(filename):
    with open(os.path.join(KB_PATH, filename), "r", encoding="utf-8") as f:
        return json.load(f)


# Emergency Contacts 

def get_all_emergency_contacts():
    data = _load("emergency_contacts.json")
    return data["emergency_contacts"]


def search_contacts(query):
    contacts = get_all_emergency_contacts()
    query_lower = query.lower()

    matches = [
        c for c in contacts
        if query_lower in c["name"].lower()
        or query_lower in c["category"].lower()
    ]

    return matches if matches else contacts  # return all if no match


# Committee Members 

def get_all_committee():
    data = _load("committee_members.json")
    return data["committee_members"]


def search_committee(query):
    members = get_all_committee()
    query_lower = query.lower()

    return [
        m for m in members
        if query_lower in m["name"].lower()
        or query_lower in m["role"].lower()
        or any(query_lower in r.lower() for r in m["responsibilities"])
    ]


# Vendors 

def get_all_vendors():
    data = _load("vendors.json")
    return data["vendors"]


def search_vendors(query):
    vendors = get_all_vendors()
    query_lower = query.lower()

    return [
        v for v in vendors
        if query_lower in v["name"].lower()
        or query_lower in v["category"].lower()
        or query_lower in v["notes"].lower()
    ]


# Notices 

def get_all_notices():
    data = _load("notices.json")
    # Return sorted by date, urgent first
    notices = data["notices"]
    return sorted(notices, key=lambda x: (not x["urgent"], x["date"]), reverse=False)


def get_urgent_notices():
    return [n for n in get_all_notices() if n["urgent"]]


def search_notices(query):
    notices = get_all_notices()
    query_lower = query.lower()

    return [
        n for n in notices
        if query_lower in n["title"].lower()
        or query_lower in n["content"].lower()
        or query_lower in n["category"].lower()
    ]


# Format helpers for display 
# for example, when returning results from the knowledge base to the user

def format_contact(c):
    return f"{c['name']}: {c['number']} ({c['available']})"


def format_vendor(v):
    return (
        f"{v['name']} [{v['category'].upper()}]\n"
        f"  Contact : {v['contact']}\n"
        f"  Hours   : {v['available']}\n"
        f"  Rate    : {v['rate']}\n"
        f"  Note    : {v['notes']}"
    )


def format_committee(m):
    return (
        f"{m['name']} — {m['role']} (Flat {m['flat']})\n"
        f"  Contact : {m['contact']}\n"
        f"  Email   : {m['email']}"
    )


def format_notice(n):
    urgent_tag = " URGENT" if n["urgent"] else ""
    return (
        f"[{n['date']}]{urgent_tag} {n['title']}\n"
        f"  {n['content']}"
    )