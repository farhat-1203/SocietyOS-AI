import streamlit as st
import requests
import json
import os
from pathlib import Path
from audio_recorder_streamlit import audio_recorder

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

st.set_page_config(
    page_title="SocietyOS-AI",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    /* push content down so the page title is never clipped by the top bar */
    .block-container {
        padding-top: 3.5rem !important;
        max-width: 100% !important;
    }

    .banner-info {
        background: #ebf4ff;
        border-left: 3px solid #3182ce;
        padding: 0.7rem 1rem;
        border-radius: 4px;
        font-size: 0.88rem;
        color: #2c5282;
        margin-bottom: 1rem;
    }
    .banner-urgent {
        background: #fff5f5;
        border-left: 3px solid #e53e3e;
        padding: 0.8rem 1rem;
        border-radius: 4px;
        margin-bottom: 0.6rem;
    }
    .banner-success {
        background: #f0fff4;
        border-left: 3px solid #38a169;
        padding: 0.7rem 1rem;
        border-radius: 4px;
        margin-bottom: 0.6rem;
    }
    .card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem 1.2rem;
        margin-bottom: 0.6rem;
    }
    .card-title {
        font-weight: 600;
        font-size: 0.95rem;
        color: #2d3748;
        margin-bottom: 0.3rem;
    }
    .card-meta {
        font-size: 0.8rem;
        color: #718096;
    }
    .tag {
        display: inline-block;
        padding: 0.15rem 0.55rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        margin-right: 0.3rem;
    }
    .tag-blue  { background: #ebf4ff; color: #2b6cb0; }
    .tag-red   { background: #fff5f5; color: #c53030; }
    .tag-green { background: #f0fff4; color: #276749; }
    .tag-gray  { background: #f7fafc; color: #4a5568; border: 1px solid #e2e8f0; }

    div[data-testid="column"] .stButton button {
        font-size: 0.82rem;
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
        background: white;
        color: #4a5568;
    }
    div[data-testid="column"] .stButton button:hover {
        border-color: #3182ce;
        color: #2b6cb0;
    }
    section[data-testid="stSidebar"] .stRadio label {
        font-size: 0.88rem;
        padding: 0.2rem 0;
    }
    .sidebar-logo {
        font-size: 1.1rem;
        font-weight: 700;
        color: #2c5282;
        letter-spacing: -0.3px;
    }
    .sidebar-tagline {
        font-size: 0.75rem;
        color: #a0aec0;
        margin-top: -4px;
        margin-bottom: 12px;
    }
</style>
""", unsafe_allow_html=True)

# ── Session state ──────────────────────────────────────────────────────────
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "complaint_log" not in st.session_state:
    st.session_state.complaint_log = []


# ── Page header helper ─────────────────────────────────────────────────────
def page_header(title, subtitle=""):
    """Renders page title and subtitle using inline styles — bypasses
    Streamlit's CSS injection so headings always display correctly."""
    sub_html = (
        f'<p style="font-size:0.92rem;color:#718096;margin:0.3rem 0 0 0;'
        f'line-height:1.5">{subtitle}</p>'
        if subtitle else ""
    )
    st.markdown(
        f'<div style="margin-top:0.5rem;margin-bottom:1.4rem">'
        f'<p style="font-size:1.8rem;font-weight:700;color:#1a202c;'
        f'margin:0;line-height:1.2;letter-spacing:-0.5px">{title}</p>'
        f'{sub_html}'
        f'</div>',
        unsafe_allow_html=True,
    )


# ── Sidebar ────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown('<div class="sidebar-logo">SocietyOS-AI</div>', unsafe_allow_html=True)
    st.markdown('<div class="sidebar-tagline">Housing society management</div>', unsafe_allow_html=True)
    st.markdown("---")

    page = st.radio(
        "Navigation",
        [
            "Home",
            "AI Assistant",
            "Knowledge Base",
            "Voice Complaint",
            "Notices",
            "Emergency Contacts",
            "Vendors",
            "Committee",
        ],
        label_visibility="collapsed",
    )

    st.markdown("---")

    try:
        r = requests.get(f"{API_BASE_URL}/health", timeout=3)
        if r.status_code == 200:
            st.success("API: Online", icon="✓")
        else:
            st.error("API: Offline")
    except Exception:
        st.error("API: Offline")


# ── Helpers ────────────────────────────────────────────────────────────────
def get_urgent_notices():
    try:
        r = requests.get(f"{API_BASE_URL}/knowledge/urgent", timeout=10)
        return r.json() if r.status_code == 200 else []
    except Exception:
        return []


def query_rag(question):
    try:
        r = requests.post(
            f"{API_BASE_URL}/rag/query",
            json={"question": question},
            timeout=30,
        )
        return r.json() if r.status_code == 200 else None
    except Exception as e:
        st.error(f"Request failed: {e}")
        return None


def query_knowledge_base(question):
    try:
        r = requests.post(
            f"{API_BASE_URL}/kb/query",
            json={"question": question},
            timeout=30,
        )
        return r.json() if r.status_code == 200 else None
    except Exception as e:
        st.error(f"Request failed: {e}")
        return None


def transcribe_audio(filename, data, mimetype="audio/wav"):
    try:
        r = requests.post(
            f"{API_BASE_URL}/audio/transcribe",
            files={"file": (filename, data, mimetype)},
            timeout=60,
        )
        return r.json() if r.status_code == 200 else None
    except Exception as e:
        st.error(f"Request failed: {e}")
        return None


def load_kb(filename):
    path = Path("knowledge_base") / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def show_complaint_result(result):
    if not result:
        st.error("Processing failed — is the API running?")
        return

    if result.get("status") == "rejected":
        st.warning(f"Not processed: {result.get('reason', 'Unknown reason')}")
        if result.get("transcript"):
            st.caption(f'Heard: "{result["transcript"]}"')
        return

    st.markdown(
        '<div class="banner-success">Complaint received and classified.</div>',
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("**Transcript**")
        st.markdown(
            f'<div class="card" style="min-height:80px">'
            f'{result.get("transcript", "—")}'
            f'</div>',
            unsafe_allow_html=True,
        )
        lang = result.get("language", "unknown").upper()
        st.caption(f"Detected language: {lang}")

    with col2:
        st.markdown("**Classification**")
        cat = result.get("category", "general")
        conf = float(result.get("confidence") or 0)
        priority = result.get("priority", "NORMAL")
        assigned = result.get("assigned_to", "Society Office")

        priority_tag = (
            '<span class="tag tag-red">High priority</span>'
            if priority == "HIGH"
            else '<span class="tag tag-green">Normal priority</span>'
        )

        st.markdown(
            f'<div class="card">'
            f'<div class="card-title">{cat.replace("_", " ").title()}</div>'
            f'<div class="card-meta" style="margin-bottom:0.5rem">'
            f'Confidence: {conf * 100:.0f}%</div>'
            f'{priority_tag}'
            f'<span class="tag tag-gray">{assigned}</span>'
            f'</div>',
            unsafe_allow_html=True,
        )

    st.session_state.complaint_log.append(result)


# ══════════════════════════════════════════════════════════════════════════
# HOME
# ══════════════════════════════════════════════════════════════════════════
if page == "Home":
    page_header("Dashboard", "AI-powered housing society management")

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Documents indexed", "900+")
    col2.metric("Complaint categories", "14")
    col3.metric("Emergency contacts", "10+")
    col4.metric("Vendors", "15+")

    st.markdown("---")

    urgent = get_urgent_notices()
    if urgent:
        st.markdown("**Active notices**")
        for n in urgent[:3]:
            st.markdown(
                f'<div class="banner-urgent">'
                f'<strong>{n["title"]}</strong>'
                f'<span class="tag tag-red" style="float:right">'
                f'{n["date"]}</span><br>'
                f'<span style="font-size:0.88rem; color:#4a5568">'
                f'{n["content"]}</span>'
                f'</div>',
                unsafe_allow_html=True,
            )
    else:
        st.info("No urgent notices at the moment.")

    st.markdown("---")

    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**AI features**")
        st.markdown(
            "- Ask about society rules, AGM decisions, policies\n"
            "- Submit voice complaints in Hindi, Marathi, or English\n"
            "- Smart routing — describes intent, finds the right answer"
        )
    with c2:
        st.markdown("**Quick lookup**")
        st.markdown(
            "- Emergency contacts, always one click away\n"
            "- Vendors — plumbers, electricians, cleaners\n"
            "- Committee contacts and responsibilities\n"
            "- Society notices and announcements"
        )


# ══════════════════════════════════════════════════════════════════════════
# AI ASSISTANT (RAG)
# ══════════════════════════════════════════════════════════════════════════
elif page == "AI Assistant":
    page_header(
        "AI Assistant",
        "Ask anything about society rules, AGM decisions, parking policies, "
        "facility timings, and more. Answers come from your society's own documents.",
    )

    suggestions = [
        "Can I keep a pet?",
        "What are the parking rules?",
        "Was lift replacement approved in AGM?",
        "Can I renovate my balcony?",
        "What are gym timings?",
        "How many parking slots am I allowed?",
    ]

    cols = st.columns(3)
    for i, s in enumerate(suggestions):
        if cols[i % 3].button(s, key=f"sug_{i}"):
            st.session_state["pending_q"] = s

    st.markdown("---")

    question = st.chat_input("Ask your question...")
    if "pending_q" in st.session_state:
        question = st.session_state.pop("pending_q")

    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])
            if msg.get("sources"):
                st.caption(f"Sources: {', '.join(msg['sources'])}")

    if question:
        with st.chat_message("user"):
            st.write(question)
        st.session_state.chat_history.append({"role": "user", "content": question})

        with st.chat_message("assistant"):
            with st.spinner("Searching documents..."):
                result = query_rag(question)
            if result:
                answer = result.get("answer", "No answer found.")
                sources = result.get("sources", [])
                st.write(answer)
                if sources:
                    st.caption(f"Sources: {', '.join(sources)}")
                st.session_state.chat_history.append(
                    {"role": "assistant", "content": answer, "sources": sources}
                )
            else:
                st.error("No response. Check if the API is running.")

    if st.session_state.chat_history:
        if st.button("Clear conversation"):
            st.session_state.chat_history = []
            st.rerun()


# ══════════════════════════════════════════════════════════════════════════
# KNOWLEDGE BASE
# ══════════════════════════════════════════════════════════════════════════
elif page == "Knowledge Base":
    page_header(
        "Knowledge Base",
        "Type any question — the system detects whether you need a contact, "
        "vendor, committee member, notice, or a document answer.",
    )

    examples = [
        "Who is the secretary?",
        "Is there a plumber available?",
        "Any water shutdown notice?",
        "What are the pet rules?",
        "Security guard number?",
        "Who handles parking disputes?",
    ]

    cols = st.columns(3)
    for i, ex in enumerate(examples):
        if cols[i % 3].button(ex, key=f"ex_{i}"):
            st.session_state["kb_q"] = ex

    st.markdown("")

    default_val = st.session_state.pop("kb_q", "")
    question = st.text_area(
        "Your query",
        value=default_val,
        placeholder="Type anything...",
        height=80,
        label_visibility="collapsed",
    )

    if st.button("Submit", type="primary"):
        if question.strip():
            with st.spinner("Routing query..."):
                result = query_knowledge_base(question)

            if result:
                intent = result.get("intent", "unknown").upper()
                intent_labels = {
                    "CONTACT": "Emergency contact",
                    "VENDOR": "Vendor directory",
                    "COMMITTEE": "Committee",
                    "NOTICE": "Notices",
                    "RAG": "Society documents",
                    "UNKNOWN": "General",
                }
                label = intent_labels.get(intent, intent)
                st.caption(f"Routed to: {label}")
                st.markdown(
                    f'<div class="banner-success">{result["answer"]}</div>',
                    unsafe_allow_html=True,
                )
                sources = result.get("sources") or (
                    [result["source"]] if result.get("source") else []
                )
                if sources:
                    st.caption(f"Source: {', '.join(sources)}")
            else:
                st.error("No response. Check if the API is running.")
        else:
            st.warning("Please enter a query.")


# ══════════════════════════════════════════════════════════════════════════
# VOICE COMPLAINT
# ══════════════════════════════════════════════════════════════════════════
elif page == "Voice Complaint":
    page_header(
        "Voice Complaint",
        "Record your complaint — Hindi, Marathi, or English all work. "
        "AI transcribes, categorizes, sets priority, and assigns it.",
    )

    tab1, tab2 = st.tabs(["Record", "Upload file"])

    with tab1:
        st.markdown(
            '<div class="banner-info">'
            "Click the button below to start recording. "
            "Click again to stop. Allow microphone access if prompted."
            "</div>",
            unsafe_allow_html=True,
        )

        audio_bytes = audio_recorder(
            text="",
            recording_color="#e53e3e",
            neutral_color="#4a5568",
            icon_name="microphone",
            icon_size="2x",
            pause_threshold=2.5,
            key="mic_recorder",
        )

        if audio_bytes:
            st.audio(audio_bytes, format="audio/wav")
            st.markdown("")

            col_a, col_b = st.columns([1, 5])
            with col_a:
                submit_mic = st.button("Submit", type="primary", key="btn_mic")
            with col_b:
                if st.button("Re-record", key="btn_rerecord"):
                    st.rerun()

            if submit_mic:
                with st.spinner("Processing — this takes a few seconds..."):
                    result = transcribe_audio("complaint.wav", audio_bytes, "audio/wav")
                show_complaint_result(result)
        else:
            st.markdown(
                '<div style="text-align:center; padding:2.5rem 0; color:#a0aec0">'
                '<p style="font-size:0.95rem">Press the button above and speak your complaint</p>'
                "</div>",
                unsafe_allow_html=True,
            )

    with tab2:
        uploaded = st.file_uploader(
            "Choose audio file",
            type=["wav", "mp3", "m4a", "ogg", "flac", "webm"],
            label_visibility="collapsed",
        )
        if uploaded:
            st.audio(uploaded, format=uploaded.type)
            if st.button("Submit", type="primary", key="btn_file"):
                with st.spinner("Processing..."):
                    result = transcribe_audio(
                        uploaded.name, uploaded.read(), uploaded.type
                    )
                show_complaint_result(result)

    if st.session_state.complaint_log:
        st.markdown("---")
        st.markdown(f"**Complaints this session ({len(st.session_state.complaint_log)})**")

        for i, c in enumerate(reversed(st.session_state.complaint_log)):
            cat = c.get("category", "general").replace("_", " ").title()
            priority = c.get("priority", "NORMAL")
            p_label = "High" if priority == "HIGH" else "Normal"

            with st.expander(
                f"#{len(st.session_state.complaint_log) - i}  —  "
                f"{cat}  |  {p_label} priority"
            ):
                st.write(f"**Transcript:** {c.get('transcript', '—')}")
                st.write(f"**Language:** {c.get('language', '—').upper()}")
                st.write(f"**Assigned to:** {c.get('assigned_to', '—')}")
                conf = float(c.get("confidence") or 0)
                st.caption(f"Confidence: {conf * 100:.0f}%")


# ══════════════════════════════════════════════════════════════════════════
# NOTICES
# ══════════════════════════════════════════════════════════════════════════
elif page == "Notices":
    page_header("Notices")

    urgent = get_urgent_notices()
    if urgent:
        st.markdown(f"**{len(urgent)} urgent notice(s)**")
        for n in urgent:
            st.markdown(
                f'<div class="banner-urgent">'
                f'<strong>{n["title"]}</strong>'
                f'<span class="tag tag-red" style="float:right">{n["date"]}</span>'
                f'<br><span style="font-size:0.88rem; color:#4a5568">'
                f'{n["content"]}</span>'
                f"</div>",
                unsafe_allow_html=True,
            )
        st.markdown("---")

    st.markdown("**All notices**")
    data = load_kb("notices.json")

    if data:
        notices = sorted(data.get("notices", []), key=lambda x: x["date"], reverse=True)
        for n in notices:
            is_urgent = n.get("urgent", False)
            box_cls = "banner-urgent" if is_urgent else "card"
            label = (
                '<span class="tag tag-red">Urgent</span>'
                if is_urgent
                else f'<span class="tag tag-gray">{n.get("category", "").upper()}</span>'
            )
            st.markdown(
                f'<div class="{box_cls}">'
                f'<div style="display:flex; justify-content:space-between; '
                f'align-items:center; margin-bottom:0.3rem">'
                f'<strong>{n["title"]}</strong>'
                f'<span style="display:flex; gap:0.4rem; align-items:center">'
                f'{label}'
                f'<span class="card-meta">{n["date"]}</span>'
                f"</span></div>"
                f'<span style="font-size:0.88rem; color:#4a5568">{n["content"]}</span>'
                f"</div>",
                unsafe_allow_html=True,
            )
    else:
        st.warning("Could not load notices.json")


# ══════════════════════════════════════════════════════════════════════════
# EMERGENCY CONTACTS
# ══════════════════════════════════════════════════════════════════════════
elif page == "Emergency Contacts":
    page_header("Emergency Contacts")

    data = load_kb("emergency_contacts.json")
    if data:
        contacts = data.get("emergency_contacts", [])
        search = st.text_input(
            "Search", placeholder="fire, police, security...", label_visibility="collapsed"
        )
        if search:
            s = search.lower()
            contacts = [
                c for c in contacts
                if s in c["name"].lower() or s in c["category"].lower()
            ]

        st.caption(f"{len(contacts)} contact(s)")
        st.markdown("")

        for c in contacts:
            col1, col2, col3 = st.columns([3, 2, 2])
            with col1:
                st.markdown(
                    f'<div class="card-title" style="margin-bottom:0">{c["name"]}</div>'
                    f'<div class="card-meta">{c.get("category", "").upper()}</div>',
                    unsafe_allow_html=True,
                )
            with col2:
                st.markdown(
                    f'<div style="padding-top:0.3rem">'
                    f'<code style="font-size:1rem">{c["number"]}</code>'
                    f"</div>",
                    unsafe_allow_html=True,
                )
            with col3:
                st.markdown(
                    f'<div class="card-meta" style="padding-top:0.5rem">'
                    f'{c.get("available", "")}</div>',
                    unsafe_allow_html=True,
                )
            st.markdown(
                '<hr style="margin:0.4rem 0; border:none; border-top:1px solid #f0f0f0">',
                unsafe_allow_html=True,
            )
    else:
        st.error("Could not load knowledge_base/emergency_contacts.json")


# ══════════════════════════════════════════════════════════════════════════
# VENDORS
# ══════════════════════════════════════════════════════════════════════════
elif page == "Vendors":
    page_header("Vendors & Services")

    data = load_kb("vendors.json")
    if data:
        vendors = data.get("vendors", [])
        search = st.text_input(
            "Search",
            placeholder="plumber, electrician, cleaning...",
            label_visibility="collapsed",
        )
        if search:
            s = search.lower()
            vendors = [
                v for v in vendors
                if s in v["name"].lower()
                or s in v["category"].lower()
                or s in v.get("notes", "").lower()
            ]

        categories: dict = {}
        for v in vendors:
            categories.setdefault(v["category"], []).append(v)

        st.caption(f"{len(vendors)} vendor(s) across {len(categories)} category group(s)")
        st.markdown("")

        for cat, vendor_list in categories.items():
            with st.expander(
                f"{cat.replace('_', ' ').title()}  ({len(vendor_list)})", expanded=True
            ):
                cols = st.columns(2)
                for i, v in enumerate(vendor_list):
                    with cols[i % 2]:
                        st.markdown(
                            f'<div class="card">'
                            f'<div class="card-title">{v["name"]}</div>'
                            f'<div class="card-meta" style="margin-bottom:0.4rem">'
                            f'{v["category"].replace("_"," ").title()}</div>'
                            f'<div style="font-size:0.85rem; color:#4a5568; line-height:1.7">'
                            f'Contact: <strong>{v["contact"]}</strong><br>'
                            f'Hours: {v.get("available", "N/A")}<br>'
                            f'Rate: {v.get("rate", "N/A")}'
                            f"</div>"
                            + (
                                f'<div class="card-meta" style="margin-top:0.4rem">'
                                f'{v["notes"]}</div>'
                                if v.get("notes")
                                else ""
                            )
                            + "</div>",
                            unsafe_allow_html=True,
                        )
    else:
        st.error("Could not load knowledge_base/vendors.json")


# ══════════════════════════════════════════════════════════════════════════
# COMMITTEE
# ══════════════════════════════════════════════════════════════════════════
elif page == "Committee":
    page_header("Managing Committee")

    data = load_kb("committee_members.json")
    if data:
        members = data.get("committee_members", [])
        search = st.text_input(
            "Search",
            placeholder="chairman, secretary...",
            label_visibility="collapsed",
        )
        if search:
            s = search.lower()
            members = [
                m for m in members
                if s in m["name"].lower()
                or s in m["role"].lower()
                or any(s in r.lower() for r in m.get("responsibilities", []))
            ]

        st.caption(f"{len(members)} member(s)")
        st.markdown("")

        cols = st.columns(2)
        for i, m in enumerate(members):
            with cols[i % 2]:
                responsibilities = m.get("responsibilities", [])
                resp_html = "".join(f"<li>{r}</li>" for r in responsibilities)
                st.markdown(
                    f'<div class="card">'
                    f'<div class="card-title">{m["name"]}</div>'
                    f'<div style="margin-bottom:0.5rem">'
                    f'<span class="tag tag-blue">{m.get("role", "")}</span>'
                    f'<span class="tag tag-gray">Flat {m.get("flat", "")}</span>'
                    f"</div>"
                    f'<div style="font-size:0.85rem; color:#4a5568; line-height:1.8">'
                    f'{m.get("contact", "")}<br>'
                    f'{m.get("email", "")}'
                    f"</div>"
                    + (
                        f'<div class="card-meta" style="margin-top:0.6rem">'
                        f'<ul style="margin:0; padding-left:1.1rem; font-size:0.8rem">'
                        f"{resp_html}</ul></div>"
                        if resp_html
                        else ""
                    )
                    + "</div>",
                    unsafe_allow_html=True,
                )
    else:
        st.error("Could not load knowledge_base/committee_members.json")


# ── Footer ─────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    '<p style="text-align:center; color:#a0aec0; font-size:0.8rem">'
    "SocietyOS-AI &nbsp;·&nbsp; FastAPI + Streamlit + Whisper + RAG"
    "</p>",
    unsafe_allow_html=True,
)