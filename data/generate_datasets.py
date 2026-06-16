import random
import json
import csv
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_JUSTIFY

# Indian society names
SOCIETY_NAMES = [
    "Green Meadows CHS Ltd.", "Sapphire Heights Cooperative Housing Society",
    "Vasant Vihar Apartments", "Royal Enclave CHS", "Palm Grove Residences",
    "Orchid Petals Society", "The Imperial Towers", "Whispering Willows CHS",
    "Skyline Residency", "Harmony Heights", "Silver Oaks Apartment Owners Association",
    "Eco-Village CHS", "Golden Gate Apartments", "Serene Waters Society",
    "Pearl Residency", "Sunrise Enclave", "The Pinnacle CHS", "Lotus Boulevard",
    "Crystal Heights", "Shanti Vihar Apartments", "Hillview Cooperative Housing Society",
    "Maple Woods Enclave", "Banyan Tree Residences", "Ocean View CHS",
    "Desert Rose Apartments", "Zenith Towers", "Cedar Crest Society",
    "Spring Gardens CHS", "Grandeur Park Residences", "The Meadows",
    "Paradise Heights", "Victoria Apartments", "Emerald Bay CHS",
    "Ruby Residency", "Diamond Plaza", "Platinum Towers", "Golden Heights",
    "Silver Springs", "Blue Horizons CHS", "Sunset Point Apartments"
]

# Indian names
FIRST_NAMES = [
    "Rajesh", "Priya", "Amit", "Sunita", "Vikram", "Anjali", "Ramesh", "Kavita",
    "Suresh", "Meera", "Anil", "Pooja", "Sandeep", "Neha", "Rakesh", "Deepika",
    "Mahesh", "Swati", "Vikas", "Ritu", "Sanjay", "Shweta", "Manoj", "Preeti",
    "Ashok", "Nisha", "Dinesh", "Komal", "Ajay", "Shruti", "Pankaj", "Anita",
    "Ravi", "Sneha", "Nitin", "Jyoti", "Kiran", "Varun", "Seema", "Rohit",
    "Madhuri", "Saurabh", "Pallavi", "Abhishek", "Manisha", "Sachin", "Rupali"
]

LAST_NAMES = [
    "Sharma", "Patel", "Kumar", "Singh", "Reddy", "Nair", "Iyer", "Desai",
    "Gupta", "Mehta", "Shah", "Joshi", "Kulkarni", "Rao", "Pillai", "Menon",
    "Agarwal", "Malhotra", "Kapoor", "Chopra", "Verma", "Sinha", "Bose", "Das"
]

def generate_random_date(start_year=2024, end_year=2027):
    """Generate random date"""
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)

def get_random_name():
    """Generate random Indian name"""
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

# ==================== AGM MINUTES GENERATION ====================

def generate_agm_minutes(count=100):
    """Generate AGM minutes documents"""
    agm_documents = []
    
    agenda_items_pool = [
        "Approval of Annual Financial Statements FY 2025-26",
        "Appointment of Statutory Auditors",
        "Ratification of Committee Decisions",
        "Lift Replacement Proposal",
        "CCTV Installation in Common Areas",
        "Water Tank Cleaning and Maintenance",
        "Building Painting and Waterproofing",
        "Parking Space Allocation",
        "Gym Equipment Upgrade",
        "Clubhouse Renovation",
        "Swimming Pool Repairs",
        "Fire Safety Compliance",
        "Solar Panel Installation",
        "Rainwater Harvesting System",
        "Garden Landscaping",
        "Intercom System Upgrade",
        "Waste Management System",
        "Security Personnel Increment",
        "Generator Replacement",
        "Terrace Usage Policy"
    ]
    
    for i in range(count):
        society_name = random.choice(SOCIETY_NAMES)
        meeting_date = generate_random_date(2024, 2027)
        chairman = get_random_name()
        secretary = get_random_name()
        treasurer = get_random_name()
        
        # Select random agenda items
        num_items = random.randint(8, 15)
        agenda_items = random.sample(agenda_items_pool, min(num_items, len(agenda_items_pool)))
        
        # Determine approved and rejected
        num_approved = random.randint(5, len(agenda_items) - 2)
        approved = agenda_items[:num_approved]
        rejected = agenda_items[num_approved:]
        
        # Generate voting details
        total_members = random.randint(80, 250)
        present = random.randint(int(total_members * 0.4), int(total_members * 0.7))
        
        doc = f"""**Document Type:** AGM Minutes
**Society Name:** {society_name}
**Meeting Date:** {meeting_date.strftime('%d %B %Y')}
**Meeting Time:** 10:00 AM
**Venue:** Society Clubhouse

**Committee Members Present:**
- **Chairman:** {chairman}
- **Secretary:** {secretary}
- **Treasurer:** {treasurer}

**Quorum:** Total Members: {total_members} | Members Present: {present} | Quorum Met: Yes

**Agenda Items Discussed:**

"""
        
        # Add approved items
        doc += "**APPROVED PROPOSALS:**\n\n"
        for idx, item in enumerate(approved, 1):
            votes_for = random.randint(int(present * 0.6), present - 5)
            votes_against = present - votes_for
            cost = random.randint(50000, 5000000)
            
            doc += f"{idx}. **{item}**\n"
            doc += f"   - Votes For: {votes_for} | Against: {votes_against}\n"
            doc += f"   - Estimated Cost: ₹{cost:,}\n"
            doc += f"   - Status: APPROVED\n"
            
            if "Lift" in item:
                doc += f"   - Vendor: {random.choice(['Otis India', 'Kone Elevators', 'Schindler India', 'ThyssenKrupp'])}\n"
                doc += f"   - Timeline: {random.randint(30, 90)} days\n"
            elif "CCTV" in item:
                doc += f"   - Number of Cameras: {random.randint(20, 60)}\n"
                doc += f"   - Vendor: {random.choice(['CP Plus', 'Hikvision', 'Dahua', 'Honeywell'])}\n"
            elif "Parking" in item:
                doc += f"   - Additional Slots: {random.randint(10, 30)}\n"
            
            doc += "\n"
        
        # Add rejected items
        if rejected:
            doc += "**REJECTED PROPOSALS:**\n\n"
            for idx, item in enumerate(rejected, 1):
                votes_for = random.randint(10, int(present * 0.4))
                votes_against = present - votes_for
                
                doc += f"{idx}. **{item}**\n"
                doc += f"   - Votes For: {votes_for} | Against: {votes_against}\n"
                doc += f"   - Status: REJECTED\n"
                reasons = [
                    "Insufficient funds in reserve",
                    "Majority members opposed",
                    "Deferred to next AGM for further study",
                    "High cost not justified",
                    "Alternative solution suggested"
                ]
                doc += f"   - Reason: {random.choice(reasons)}\n\n"
        
        # Budget discussion
        income = random.randint(5000000, 20000000)
        expenses = int(income * random.uniform(0.85, 0.95))
        surplus = income - expenses
        
        doc += f"""**BUDGET DISCUSSION:**

**Income Statement FY {meeting_date.year - 1}-{str(meeting_date.year)[2:]}:**
- Maintenance Charges Collected: ₹{int(income * 0.75):,}
- Parking Fees: ₹{int(income * 0.10):,}
- Late Payment Interest: ₹{int(income * 0.05):,}
- Other Income: ₹{int(income * 0.10):,}
- **Total Income:** ₹{income:,}

**Expenditure:**
- Staff Salaries: ₹{int(expenses * 0.30):,}
- Electricity Charges: ₹{int(expenses * 0.20):,}
- Water Charges: ₹{int(expenses * 0.15):,}
- Repairs & Maintenance: ₹{int(expenses * 0.20):,}
- Administrative Expenses: ₹{int(expenses * 0.10):,}
- Miscellaneous: ₹{int(expenses * 0.05):,}
- **Total Expenses:** ₹{expenses:,}

**Surplus for the Year:** ₹{surplus:,}

"""
        
        # Maintenance discussion
        current_rate = random.uniform(2.5, 5.5)
        proposed_rate = current_rate + random.uniform(0.3, 0.8)
        
        doc += f"""**MAINTENANCE RATE DISCUSSION:**

Current Rate: ₹{current_rate:.2f} per sq.ft.
Proposed Rate: ₹{proposed_rate:.2f} per sq.ft.
Increase: ₹{proposed_rate - current_rate:.2f} per sq.ft. ({((proposed_rate - current_rate)/current_rate * 100):.1f}%)

The increase is attributed to:
- Rise in staff salaries (DA/HRA increment)
- Increased electricity tariffs
- Water supply cost escalation
- General inflation

**Vote on Maintenance Increase:** Approved ({random.randint(int(present * 0.65), present - 3)} For, {random.randint(3, int(present * 0.35))} Against)
**Effective From:** {(meeting_date + timedelta(days=30)).strftime('%d %B %Y')}

"""
        
        # Other discussions
        doc += f"""**OTHER IMPORTANT DECISIONS:**

1. **Defaulter List:** {random.randint(5, 25)} members with dues exceeding 6 months. Legal notices to be issued.

2. **Sinking Fund Utilization:** ₹{random.randint(1000000, 5000000):,} allocated for major repairs from sinking fund.

3. **Insurance Renewal:** Building insurance policy renewed with {random.choice(['HDFC Ergo', 'ICICI Lombard', 'Bajaj Allianz', 'New India Assurance'])} for ₹{random.randint(10000000, 50000000):,} coverage.

4. **Redevelopment Discussion:** {'Proposal for redevelopment study initiated. Architect to be appointed.' if random.random() > 0.7 else 'Redevelopment matter deferred to future meeting.'}

**Meeting Adjourned At:** {random.choice(['12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'])}

**Contact Information:** {secretary} (Secretary) | secretary@{society_name.lower().replace(' ', '').replace('.', '')}.com | +91-{random.randint(7000000000, 9999999999)}

***

"""
        agm_documents.append(doc)
    
    return agm_documents

print("Generating 100 AGM Minutes...")
agm_docs = generate_agm_minutes(100)

# Save AGM documents
with open('agm_minutes_raw.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(agm_docs))

print("✓ AGM Minutes saved to agm_minutes_raw.txt")


# NOTICES GENERATION

def generate_notices(count=500):
    """Generate housing society notices"""
    notices = []
    
    notice_templates = {
        "Water Shutdown": [
            "Water supply will be suspended for overhead tank cleaning and maintenance.",
            "Emergency water pipeline repair work requires temporary water shutdown.",
            "Municipal water supply maintenance scheduled by MCGM.",
            "Bore well pump replacement requires water supply interruption."
        ],
        "Lift Maintenance": [
            "Annual Maintenance Contract (AMC) servicing of all passenger lifts.",
            "Emergency brake system inspection and certification as per government norms.",
            "Lift modernization work - old control panel replacement.",
            "Wire rope replacement and load testing as per safety regulations."
        ],
        "Pest Control": [
            "Quarterly pest control and anti-termite treatment for all floors.",
            "Mosquito fogging drive in society premises and common areas.",
            "Rodent control treatment in basement and underground parking.",
            "Cockroach gel treatment in all staircases and electrical rooms."
        ],
        "Parking Rearrangement": [
            "Parking slot re-numbering and repainting work to commence.",
            "Guest parking area redesignation - some slots converted to resident parking.",
            "Two-wheeler parking zone expansion - cars to be relocated.",
            "Basement parking waterproofing - temporary relocation required."
        ],
        "Festival Celebration": [
            "Ganesh Chaturthi celebration arrangements - voluntary contribution invited.",
            "Diwali decoration and lighting of society premises - participation requested.",
            "Holi celebration in society garden - eco-friendly colors only.",
            "Christmas and New Year decoration - tree installation in lobby."
        ],
        "AGM Notice": [
            "Annual General Meeting scheduled - all members requested to attend.",
            "Special General Meeting for discussing major building repair proposal.",
            "Notice for election of new Managing Committee members.",
            "SGM for approval of redevelopment proposal - mandatory attendance."
        ],
        "Fire Drill": [
            "Mandatory fire safety drill as per Fire Department regulations.",
            "Fire extinguisher inspection and refilling - all floors covered.",
            "Fire exit route mock drill and evacuation practice.",
            "Fire alarm system testing - residents requested not to panic."
        ],
        "Security Alert": [
            "Theft incident reported in Tower B - residents advised to be cautious.",
            "Suspicious person spotted - residents to verify all visitors.",
            "Increased vigilance during festival season - lock flats when away.",
            "New security SOP implementation - visitor entry protocol updated."
        ],
        "Power Shutdown": [
            "Electrical panel maintenance requires complete power shutdown.",
            "Generator servicing scheduled - backup power unavailable during this time.",
            "EB meter replacement work by electricity board officials.",
            "Transformer maintenance by MSEDCL - power cut expected."
        ],
        "Clubhouse Closure": [
            "Clubhouse closed for annual deep cleaning and maintenance.",
            "AC repair work in clubhouse - closed temporarily.",
            "Clubhouse floor polishing and furniture repair work in progress.",
            "Pest control treatment in clubhouse - closed for 48 hours."
        ],
        "Swimming Pool Maintenance": [
            "Swimming pool closed for cleaning and chemical treatment.",
            "Pool filtration system repair - closed until further notice.",
            "Annual pool maintenance - tiles repair and water treatment.",
            "Pool depth marking and safety signage installation work."
        ],
        "Garden Maintenance": [
            "Garden landscaping and new plant installation work ongoing.",
            "Lawn grass cutting and hedge trimming scheduled.",
            "Sprinkler system repair - avoid garden area during work.",
            "Tree pruning and pesticide spray - keep children away."
        ],
        "Waste Collection Changes": [
            "Waste collection timings revised - new schedule effective immediately.",
            "Separate e-waste collection drive this Sunday.",
            "Bulk waste disposal day - old furniture to be kept in basement.",
            "Wet waste composting unit installation - segregation mandatory."
        ],
        "Vendor Entry Restrictions": [
            "All vendors must register with security - no entry without ID card.",
            "Delivery personnel restricted to lobby area after 10 PM.",
            "Car washing timings restricted to 6 AM - 10 AM only.",
            "Construction material delivery only between 9 AM - 5 PM."
        ],
        "Construction Activity": [
            "Renovation work in Flat 502 - expect noise between 9 AM - 5 PM.",
            "Terrace waterproofing work - access restricted for 10 days.",
            "External wall painting using scaffolding - keep windows closed.",
            "Plumbing riser replacement work - water supply affected floor-wise."
        ]
    }
    
    for i in range(count):
        category = random.choice(list(notice_templates.keys()))
        society_name = random.choice(SOCIETY_NAMES)
        notice_date = generate_random_date(2024, 2027)
        notice_num = f"NOT/{notice_date.year}/{random.randint(100, 999)}"
        
        template = random.choice(notice_templates[category])
        
        # Generate time details
        if category in ["Water Shutdown", "Power Shutdown", "Lift Maintenance"]:
            start_time = random.choice(["10:00 AM", "11:00 AM", "2:00 PM", "11:00 PM"])
            duration = random.choice(["4 hours", "6 hours", "8 hours", "until 5:00 PM"])
            action_date = notice_date + timedelta(days=random.randint(2, 7))
        elif category == "AGM Notice":
            start_time = "10:00 AM"
            duration = "2-3 hours"
            action_date = notice_date + timedelta(days=random.randint(15, 30))
        else:
            start_time = random.choice(["9:00 AM", "10:00 AM", "Morning", "Evening"])
            duration = random.choice(["2 hours", "Full day", "3 hours", "Until completion"])
            action_date = notice_date + timedelta(days=random.randint(1, 5))
        
        contact_person = get_random_name()
        
        notice = f"""**Notice Number:** {notice_num}
**Date:** {notice_date.strftime('%d %B %Y')}
**Society Name:** {society_name}
**Category:** {category}

**NOTICE TO ALL RESIDENTS**

**Subject:** {category}

**Details:**
{template}

**Scheduled Date:** {action_date.strftime('%A, %d %B %Y')}
**Time:** {start_time}
**Duration:** {duration}

"""
        
        # Add category-specific details
        if category == "Water Shutdown":
            notice += f"""**Action Required:**
- Store sufficient water in advance for drinking and cooking
- Fill overhead tanks in individual flats before shutdown
- Do not run washing machines or dishwashers during this period
- Check taps before leaving - water may resume suddenly

**Affected Areas:** All towers and wings

"""
        
        elif category == "Lift Maintenance":
            notice += f"""**Action Required:**
- Use alternate lifts or staircases during maintenance
- Senior citizens needing assistance may contact security
- Heavy goods movement to be rescheduled
- Passenger Lift {random.randint(1, 4)} will remain operational

**Lift Affected:** Service Lift / Lift No. {random.randint(1, 5)}

"""
        
        elif category == "Pest Control":
            notice += f"""**Action Required:**
- Keep all food items covered and stored properly
- Remove pets from the treatment area temporarily
- Open windows during fogging (if applicable)
- Clean under kitchen sink and clear that area
- Keep children away from sprayed areas for 30 minutes

**Vendor:** {random.choice(['PestoPro Services', 'TermiGuard India', 'Urban Pest Control', 'CleanEx Solutions'])}

"""
        
        elif category == "Parking Rearrangement":
            notice += f"""**Action Required:**
- Remove vehicles from marked slots by 8:00 AM on work day
- Temporary parking available in guest area
- Work completion expected in {random.randint(2, 5)} days
- New parking stickers will be issued upon completion

**Contact:** Parking Committee Chairperson

"""
        
        elif category == "AGM Notice":
            notice += f"""**Agenda:**
1. Approval of previous AGM minutes
2. Presentation of audited financial statements
3. Budget approval for next financial year
4. Election of Managing Committee members
5. Discussion on major repair proposals
6. Any other matter with Chairman's permission

**Quorum:** Minimum {random.randint(30, 50)} members required

**Venue:** Society Clubhouse / Community Hall

**Note:** Members unable to attend may authorize proxy as per bye-laws

"""
        
        elif category == "Fire Drill":
            notice += f"""**Action Required:**
- Familiarize yourself with fire exit routes
- Do not use lifts during drill - use staircases only
- Assemble at designated safe zone near main gate
- Fire alarm will sound at {start_time} - do not panic
- Mandatory participation - at least one member per flat

**Conducted By:** Fire Safety Officer with local fire brigade

"""
        
        elif category == "Security Alert":
            notice += f"""**Advisory:**
- Always verify visitor identity before allowing entry
- Do not share OTPs or gate access codes
- Report any suspicious activity immediately to security
- Ensure domestic help has proper police verification
- Keep valuables in lockers when traveling

**Emergency Contacts:**
Security Control Room: Ext. {random.randint(100, 199)}
Police Station: {random.choice(['100', '022-23456789', '011-28765432'])}

"""
        
        notice += f"""**Contact Person:** {contact_person} ({random.choice(['Secretary', 'Manager', 'Chairperson', 'Treasurer'])})
**Phone:** +91-{random.randint(7000000000, 9999999999)}
**Email:** office@{society_name.lower().replace(' ', '').replace('.', '')}.com

**Issued By:** Managing Committee, {society_name}

***

"""
        notices.append(notice)
    
    return notices

print("Generating 500 Housing Society Notices...")
notices = generate_notices(500)

with open('society_notices_raw.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(notices))

print("✓ Notices saved to society_notices_raw.txt")


# CIRCULARS GENERATION 

def generate_circulars(count=300):
    """Generate housing society circulars"""
    circulars = []
    
    circular_types = {
        "New Parking Rules": {
            "subject": "Revised Parking Policy and Slot Allocation Guidelines",
            "rules": [
                "One parking slot per flat as per original allotment deed",
                "Second parking available on rental basis - ₹1,500 per month",
                "Guest parking limited to 6 hours - overstay fine ₹500",
                "No parking in fire lane - violators will be towed",
                "Visitor vehicles must display dashboard pass",
                "Two-wheeler parking only in designated zones"
            ]
        },
        "Pet Registration Requirement": {
            "subject": "Mandatory Registration of Pets and Animal Welfare Guidelines",
            "rules": [
                "All pet dogs and cats must be registered with society office",
                "Annual vaccination certificate to be submitted",
                "Pets must be on leash (max 6 feet) in common areas",
                "Pet waste must be cleaned immediately by owners",
                "Aggressive pets must be muzzled in public areas",
                "Lift usage allowed but give preference to seniors"
            ]
        },
        "Mandatory Visitor Registration": {
            "subject": "Enhanced Security Protocol - Visitor Management System",
            "rules": [
                "All visitors must be pre-approved via society app",
                "Manual entry allowed only after resident confirmation via intercom",
                "Delivery executives restricted to lobby after 10 PM",
                "Overnight guests must be registered at main gate",
                "Domestic help requires police verification and photo ID",
                "Frequent visitors (tutors, nurses) must have monthly pass"
            ]
        },
        "Fire Safety Compliance": {
            "subject": "Fire Safety Measures - Mandatory Compliance Requirements",
            "rules": [
                "Fire extinguishers must be recharged annually",
                "Fire doors to be kept closed (not locked) at all times",
                "No storage of combustible materials in staircases",
                "Smoke detectors must be functional - testing every 6 months",
                "Fire drill participation mandatory twice a year",
                "Emergency exit routes must be unobstructed"
            ]
        },
        "Noise Restrictions": {
            "subject": "Noise Pollution Control - Quiet Hours Policy",
            "rules": [
                "Quiet hours: 10:30 PM to 6:30 AM and 2:00 PM to 4:00 PM",
                "No drilling, hammering, or construction noise during quiet hours",
                "Music and TV volume to be kept at reasonable levels",
                "Parties must end by 11:00 PM on weekdays, 12:00 AM on weekends",
                "Generator usage restricted to emergencies only",
                "Washing machine usage discouraged after 10:00 PM"
            ]
        },
        "Renovation Approval Process": {
            "subject": "Guidelines for Internal Renovation and Structural Work",
            "rules": [
                "NOC required from society for any structural changes",
                "Refundable deposit: ₹25,000 before starting work",
                "Permitted hours: 9:00 AM to 5:00 PM, Monday to Saturday",
                "No work on Sundays and public holidays",
                "Debris must be removed within 24 hours",
                "Load-bearing walls cannot be altered under any circumstance"
            ]
        },
        "Vendor Verification Process": {
            "subject": "Vendor Registration and Background Verification Policy",
            "rules": [
                "All regular vendors must register with society office",
                "Police verification mandatory for housekeeping staff",
                "Photo ID card to be issued by society - ₹100 fee",
                "Vendor cards valid for 6 months - renewal required",
                "Service providers must have GST certificate",
                "Unauthorized vendors will be barred from premises"
            ]
        },
        "Water Conservation Measures": {
            "subject": "Water Conservation Initiative - Usage Guidelines",
            "rules": [
                "Car washing limited to two buckets - no hose pipes",
                "Washing timings: 6:00 AM to 10:00 AM only",
                "Report leaking taps and pipes immediately",
                "Rainwater harvesting system installed - cooperation required",
                "Overhead tank cleaning every 3 months",
                "Penalty for water wastage: ₹1,000 per incident"
            ]
        },
        "Maintenance Payment Reminders": {
            "subject": "Timely Payment of Maintenance Charges - Penalty Notification",
            "rules": [
                "Maintenance due by 10th of every month",
                "Late payment interest: 18% per annum after 15th",
                "Defaulters beyond 60 days barred from amenities",
                "Legal notice after 90 days non-payment",
                "Names of chronic defaulters displayed on notice board",
                "Society can initiate recovery under Section 101 of MCS Act"
            ]
        }
    }
    
    for i in range(count):
        circular_type = random.choice(list(circular_types.keys()))
        circular_data = circular_types[circular_type]
        
        society_name = random.choice(SOCIETY_NAMES)
        circular_date = generate_random_date(2024, 2027)
        circular_num = f"CIR/{circular_date.year}/{random.randint(10, 199):03d}"
        
        issued_by = random.choice([
            "Managing Committee",
            "Secretary",
            "Chairperson",
            "Estate Manager",
            f"{get_random_name()} (Secretary)"
        ])
        
        effective_date = circular_date + timedelta(days=random.randint(7, 30))
        
        circular = f"""**Circular Number:** {circular_num}
**Date:** {circular_date.strftime('%d %B %Y')}
**Society Name:** {society_name}
**Issued By:** {issued_by}

**Subject:** {circular_data['subject']}

**To All Members,**

This circular is issued to inform all residents about the {circular_type.lower()} that have been approved by the Managing Committee and are hereby notified for strict compliance.

**Detailed Explanation:**

"""
        
        # Add context-specific explanation
        if "Parking" in circular_type:
            circular += f"""The society has {random.randint(100, 300)} parking slots for {random.randint(150, 400)} flats. Due to increasing complaints about unauthorized parking and space shortage, the committee has revised the parking policy. This policy aims to ensure fair allocation and systematic management of limited parking resources.

The new parking rules have been formulated after consultation with {random.randint(15, 30)} resident representatives and legal advisors. These rules are binding on all residents, tenants, and their guests.

"""
        
        elif "Pet" in circular_type:
            circular += f"""As per Animal Welfare Board of India (AWBI) guidelines and judgment of the Honorable Supreme Court, the society cannot ban pets. However, to ensure harmonious coexistence and address concerns of non-pet owners, the following registration and conduct guidelines are being implemented.

Currently, approximately {random.randint(25, 80)} pet dogs and {random.randint(10, 40)} cats reside in our society. Proper registration will help maintain records and ensure responsible pet ownership.

"""
        
        elif "Visitor" in circular_type:
            circular += f"""In view of recent security incidents in neighboring societies and to enhance the safety of all residents, the Managing Committee has decided to implement a comprehensive visitor management system. 

The society has invested ₹{random.randint(200000, 800000):,} in digital gate management infrastructure including facial recognition cameras and automated entry systems. All residents are requested to cooperate with security personnel.

"""
        
        elif "Fire Safety" in circular_type:
            circular += f"""As per Maharashtra Fire Prevention and Life Safety Measures Act, 2006, and recent directives from the Fire Department, all residential societies must comply with specified fire safety norms. The last fire audit identified {random.randint(5, 15)} areas requiring immediate attention.

The society has appointed {random.choice(['M/s Fire Safe Solutions', 'Phoenix Fire Systems', 'SecureFire India'])} as authorized fire safety consultants. Non-compliance may result in penalties from municipal authorities.

"""
        
        elif "Noise" in circular_type:
            circular += f"""The society has received {random.randint(15, 40)} written complaints in the last {random.randint(3, 6)} months regarding noise disturbances during late hours. The Managing Committee is duty-bound to ensure peaceful living environment for all residents.

As per Noise Pollution (Regulation and Control) Rules, 2000, residential areas are classified as 'Silence Zone' and permissible noise levels must be maintained. Repeated violations may lead to police complaints.

"""
        
        elif "Renovation" in circular_type:
            circular += f"""To prevent unauthorized structural modifications that may compromise building safety and to minimize inconvenience to other residents, the society has formulated a comprehensive renovation approval process.

The society engineer will inspect the work site before and after renovation. Any structural damage to common areas or neighboring flats will result in forfeiture of the security deposit and additional penalty.

"""
        
        elif "Water" in circular_type:
            circular += f"""The society's daily water consumption has increased to {random.randint(30000, 80000)} liters. With depleting groundwater levels and erratic municipal supply, water conservation is no longer optional but essential.

The society has installed flow meters and leak detection systems. Residents consuming excessive water (above {random.randint(500, 800)} liters per day per flat) will be identified and counseled.

"""
        
        elif "Maintenance" in circular_type:
            circular += f"""As of {circular_date.strftime('%B %Y')}, the society has outstanding dues of ₹{random.randint(500000, 3000000):,} from {random.randint(15, 60)} defaulting members. This affects the society's ability to maintain essential services and undertake repairs.

The committee has exhausted all informal reminders and is now compelled to take legal action. Members are urged to clear pending dues immediately to avoid legal complications and damage to their credit record.

"""
        
        else:
            circular += f"""This policy has been formulated keeping in mind the welfare and safety of all {random.randint(200, 500)} families residing in our society. The committee requests full cooperation from all members in implementing these guidelines.

"""
        
        # Add applicable rules
        circular += "**Applicable Rules:**\n\n"
        for idx, rule in enumerate(circular_data['rules'], 1):
            circular += f"{idx}. {rule}\n"
        
        circular += f"""
**Effective Date:** {effective_date.strftime('%d %B %Y')}

**Penalty for Non-Compliance:**
First Violation: Written warning
Second Violation: Fine of ₹{random.choice([500, 1000, 2000, 5000])}
Repeated Violations: Matter referred to Managing Committee for further action

**Implementation:**
- All residents must acknowledge receipt of this circular
- Tenants to be informed by flat owners
- Copy displayed on all notice boards
- Soft copy available on society app/website

For any clarifications, please contact the society office during working hours (10:00 AM to 1:00 PM and 4:00 PM to 7:00 PM).

**Issued By:**
{issued_by}
{society_name}

**Contact:** office@{society_name.lower().replace(' ', '').replace('.', '')}.com
**Phone:** +91-{random.randint(7000000000, 9999999999)}

***

"""
        circulars.append(circular)
    
    return circulars

print("Generating 300 Housing Society Circulars...")
circulars = generate_circulars(300)

with open('society_circulars_raw.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(circulars))

print("✓ Circulars saved to society_circulars_raw.txt")


# COMPLAINTS CSV GENERATION 

def generate_complaints_csv(count=5000):
    """Generate complaints dataset in CSV format"""
    
    categories = {
        "Plumbing": [
            "There is water leakage below the kitchen sink.",
            "Bathroom tap is dripping continuously - water wastage.",
            "Flush is not working properly - water keeps running.",
            "Hot water geyser not functioning.",
            "Drainage pipe blocked - water overflowing in bathroom.",
            "WC seat broken and needs replacement.",
            "Water pressure very low in kitchen.",
            "Leakage from ceiling - upstairs neighbor may have issue.",
            "Bathroom exhaust fan making noise and not working.",
            "Kitchen sink drain clogged completely."
        ],
        "Electrical": [
            "Power socket in bedroom not working.",
            "Main MCB tripping frequently.",
            "Tube light flickering continuously.",
            "Doorbell not functioning.",
            "Ceiling fan making noise and wobbling.",
            "AC point not providing power.",
            "Inverter not charging - keeps beeping.",
            "Light switch broken - needs replacement.",
            "Electric meter showing wrong reading.",
            "Staircase light not working for past 3 days."
        ],
        "Lift": [
            "Lift number 2 has stopped working.",
            "Lift door not closing properly - safety issue.",
            "Lift stuck between floors - very dangerous.",
            "Lift making strange grinding noise.",
            "Emergency alarm button inside lift not working.",
            "Lift indicator showing wrong floor numbers.",
            "Service lift out of order since morning.",
            "Lift cabin light not working - dark inside.",
            "Lift door sensor faulty - closes too fast.",
            "Lift overload alarm malfunctioning."
        ],
        "Security": [
            "Unknown person loitering in basement parking.",
            "CCTV camera in our floor not working.",
            "Main gate boom barrier not functioning.",
            "Security guard sleeping on duty at night.",
            "Visitor entered without proper verification.",
            "Unauthorized vehicle parked in society.",
            "Security not checking delivery personnel properly.",
            "Gate access card not working.",
            "Intercom system not connecting to gate.",
            "Theft reported - jewellery stolen from flat."
        ],
        "Parking": [
            "A vehicle is blocking my parking slot.",
            "Someone has parked in my allotted space.",
            "Guest parking area always full - no space.",
            "Vehicle without society sticker parked for many days.",
            "Two-wheeler parked in car parking area.",
            "Parking slot number faded - need repainting.",
            "Neighbor using my second parking without permission.",
            "Car scratched by another vehicle in parking.",
            "Parking area waterlogged after rain.",
            "Boom barrier hitting car roof - too low."
        ],
        "Housekeeping": [
            "Garbage not collected from our floor today.",
            "Staircase very dirty - not cleaned for days.",
            "Lift cabin smelling bad - needs cleaning.",
            "Dustbin overflowing in common area.",
            "Housekeeping staff coming late daily.",
            "Lobby floor tiles need mopping urgently.",
            "Cobwebs all over corridor ceiling.",
            "Garbage chute door broken.",
            "Common area washroom very dirty.",
            "Sweeper not doing job properly."
        ],
        "Garden": [
            "Garden sprinklers not working properly.",
            "Overgrown bushes blocking walkway.",
            "Children's play area swings broken.",
            "Garden bench damaged and needs repair.",
            "Too many mosquitoes due to stagnant water in garden.",
            "Dog waste not cleaned from garden regularly.",
            "Garden lights not functioning at night.",
            "Lawn grass overgrown - needs cutting.",
            "Garden gate lock broken.",
            "Plants dying due to lack of maintenance."
        ],
        "Water Supply": [
            "No water supply since morning in our flat.",
            "Water coming muddy and dirty.",
            "Very low water pressure on higher floors.",
            "Overhead tank overflow causing seepage.",
            "Water supply timing irregular - unpredictable.",
            "Water motor making loud noise at night.",
            "Underground tank needs urgent cleaning.",
            "Water pipe burst in basement.",
            "Bore well pump not working.",
            "Society water bill very high - possible leakage."
        ],
        "Waste Management": [
            "Residents not segregating wet and dry waste.",
            "E-waste collection bin overflowing.",
            "Bad smell from garbage collection area.",
            "Waste segregation bins not provided on our floor.",
            "Garbage collection timing too early.",
            "Composting pit emitting foul odor.",
            "Bulk waste dumped in common area.",
            "Plastic waste burning in society - health hazard.",
            "Garbage bags torn by stray dogs.",
            "No separate bin for medical waste."
        ],
        "Noise": [
            "Neighbor playing loud music late at night.",
            "Construction noise from upstairs flat during quiet hours.",
            "Generator running continuously making too much noise.",
            "Dogs barking loudly throughout night.",
            "Party in neighboring flat - very loud till 2 AM.",
            "Children running and jumping in flat above ours.",
            "Heavy furniture being dragged at odd hours.",
            "Music practice during afternoon quiet hours.",
            "Loud arguments and shouting from neighbor's flat.",
            "Vehicle horn being used unnecessarily in society."
        ],
        "Pest Control": [
            "Rat problem in our flat - need urgent pest control.",
            "Cockroaches coming from neighbor's flat.",
            "Bed bugs in bedroom - very serious problem.",
            "Termites eating wooden furniture.",
            "Too many mosquitoes - fogging required.",
            "Ants everywhere in kitchen despite cleaning.",
            "Pigeons nesting on AC outdoor unit.",
            "Lizards entering flat from outside.",
            "Spider webs all over balcony.",
            "Fruit flies in kitchen - very unhygienic."
        ],
        "Clubhouse": [
            "Clubhouse AC not working properly.",
            "Gym equipment broken and unsafe to use.",
            "Swimming pool water very dirty - not cleaned.",
            "Clubhouse booking system not functioning.",
            "Table tennis rackets and balls missing.",
            "Clubhouse washroom taps not working.",
            "Yoga room floor mat torn and unhygienic.",
            "Clubhouse closed without prior notice.",
            "Unauthorized persons using clubhouse facilities.",
            "Clubhouse lights not working in evening."
        ],
        "Swimming Pool": [
            "Pool water not chlorinated - unhygienic.",
            "Pool changing room locks broken.",
            "Life guard absent during pool hours.",
            "Pool tiles broken - can cause injury.",
            "Pool filtration system not working.",
            "Depth markings not visible.",
            "Shower area not functioning.",
            "Pool ladder rusted and unsafe.",
            "Children's pool empty and dirty.",
            "Pool timings not displayed properly."
        ],
        "Gym": [
            "Treadmill not working for past week.",
            "Gym AC insufficient - too hot inside.",
            "Dumbbell weights missing - incomplete set.",
            "Gym floor mat torn - slipping hazard.",
            "Gym mirror cracked - dangerous.",
            "Weight machine cable broken.",
            "Gym exhaust fan not working - suffocating.",
            "Gym door lock jammed.",
            "Bench press bench wobbling - unsafe.",
            "Gym timings board removed."
        ],
        "Common Area": [
            "Corridor light not working - very dark.",
            "Common area notice board glass broken.",
            "Fire extinguisher expired - needs refilling.",
            "Letter box lock broken - security risk.",
            "Staircase railing loose - can cause accident.",
            "Common area wall paint peeling off.",
            "Lobby ceiling leakage during rain.",
            "Entrance door closer not working.",
            "Nameplate board outside flat damaged.",
            "Emergency exit door jammed and locked."
        ]
    }
    
    priorities = ["Low", "Medium", "High", "Critical"]
    statuses = ["Open", "Assigned", "In Progress", "Resolved"]
    
    # Indian language complaint templates
    hindi_complaints = {
        "Plumbing": ["Kitchen ke sink ke neeche paani leak ho raha hai", "Bathroom ka tap band nahi ho raha", "Flush kharab hai", "Geyser chalu nahi ho raha"],
        "Electrical": ["Bedroom ka socket kaam nahi kar raha", "Light jal nahi rahi", "Fan awaaz kar raha hai", "MCB baar baar trip ho raha hai"],
        "Lift": ["Lift kharab ho gayi hai", "Lift ka darwaza thik se band nahi hota", "Lift mein bahut awaaz aa rahi hai"],
        "Security": ["Anjan aadmi basement mein ghoom raha tha", "CCTV camera kaam nahi kar raha", "Security guard duty pe nahi hai"],
        "Parking": ["Mere parking mein koi aur gaadi khadi hai", "Parking area mein paani bhara hua hai"]
    }
    
    marathi_complaints = {
        "Plumbing": ["Kitchen madhe sink khali pani ghalat ahe", "Bathroom cha tap band hot nahi", "Flush kharab jhala ahe"],
        "Electrical": ["Bedroom madhil socket kaam karat nahi", "Light jaldi nahi", "Pankha awaaz karto"],
        "Lift": ["Lift kharab jhali ahe", "Lift cha darwaza band hot nahi", "Lift madhe khup awaaz yetoy"],
        "Security": ["Olakhit vyakti basement madhe phirat hoti", "CCTV camera kaam karat nahi"],
        "Parking": ["Majhya parking madhe dusryachi gaadi ubhi ahe", "Parking area madhe paani jamla ahe"]
    }
    
    hinglish_complaints = {
        "Plumbing": ["Bhai bathroom ke niche se paani leak ho raha hai", "Kitchen ka tap drip kar raha hai continuously"],
        "Electrical": ["Yaar light nahi aa rahi room mein", "Socket kaam nahi kar raha hai boss"],
        "Lift": ["Lift full kharab hai bhai", "Lift ki door properly close nahi hoti"],
        "Security": ["Security guard kuch check hi nahi karta entry pe", "CCTV toh kaam hi nahi karta"],
        "Parking": ["Mere slot mein kisi ne gaadi park kar di hai yaar", "Parking full waterlogged hai"]
    }
    
    staff_names = [
        get_random_name() for _ in range(30)
    ]
    
    complaints_data = []
    
    for i in range(count):
        complaint_id = f"CMP{random.randint(10000, 99999)}"
        society_name = random.choice(SOCIETY_NAMES)
        flat_number = f"{random.choice(['A', 'B', 'C', 'D'])}-{random.randint(101, 2505)}"
        resident_name = get_random_name()
        category = random.choice(list(categories.keys()))
        priority = random.choice(priorities)
        status = random.choice(statuses)
        assigned_to = random.choice(staff_names)
        
        # Determine language
        lang_choice = random.random()
        if lang_choice < 0.60:  # 60% English
            complaint_text = random.choice(categories[category])
        elif lang_choice < 0.75:  # 15% Hindi
            if category in hindi_complaints:
                complaint_text = random.choice(hindi_complaints[category])
            else:
                complaint_text = random.choice(categories[category])
        elif lang_choice < 0.85:  # 10% Marathi
            if category in marathi_complaints:
                complaint_text = random.choice(marathi_complaints[category])
            else:
                complaint_text = random.choice(categories[category])
        else:  # 15% Hinglish
            if category in hinglish_complaints:
                complaint_text = random.choice(hinglish_complaints[category])
            else:
                complaint_text = random.choice(categories[category])
        
        complaints_data.append({
            'complaint_id': complaint_id,
            'society_name': society_name,
            'flat_number': flat_number,
            'resident_name': resident_name,
            'complaint_text': complaint_text,
            'category': category,
            'priority': priority,
            'status': status,
            'assigned_to': assigned_to
        })
    
    # Write to CSV
    with open('housing_society_complaints.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['complaint_id', 'society_name', 'flat_number', 'resident_name', 'complaint_text', 'category', 'priority', 'status', 'assigned_to']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for complaint in complaints_data:
            writer.writerow(complaint)
    
    return complaints_data

print("Generating 5000 Complaints CSV...")
complaints = generate_complaints_csv(5000)
print("✓ Complaints CSV saved to housing_society_complaints.csv")


# VOICE COMPLAINTS JSON GENERATION

def generate_voice_complaints_json(count=2000):
    """Generate voice-style complaints in JSON format"""
    
    voice_complaints_templates = {
        "Plumbing": {
            "Hindi": [
                ("Bhai bathroom ke niche se paani leak ho raha hai", "Water leakage detected below bathroom wash basin. Inspection required."),
                ("Kitchen ka sink band ho gaya hai pura", "Kitchen sink drainage completely blocked. Plumber assistance needed."),
                ("Flush theek se kaam nahi kar raha hai", "WC flush not functioning properly. Repair required."),
                ("Geyser se paani nahi aa raha garam", "Hot water geyser not working. Technical inspection needed."),
                ("Tap se paani baar baar gir raha hai", "Tap dripping continuously causing water wastage. Repair needed.")
            ],
            "Marathi": [
                ("Bathroom madhun paani galit ahe", "Water leakage from bathroom detected. Plumbing work required."),
                ("Kitchen cha sink block jhala ahe", "Kitchen sink blocked. Need plumber urgently."),
                ("Flush kaam karat nahi properly", "Toilet flush malfunction. Repair needed."),
                ("Garam pani yet nahi ahe geyser madhun", "No hot water from geyser. Equipment check required."),
                ("Tap band hot nahi porpat", "Tap not closing properly. Washer replacement needed.")
            ],
            "English": [
                ("Water is leaking under the sink", "Water leakage under kitchen/bathroom sink. Plumber required."),
                ("The flush is not working at all", "Toilet flush completely non-functional. Urgent repair needed."),
                ("Bathroom tap won't stop dripping", "Bathroom tap continuous drip. Washer replacement required."),
                ("No hot water coming from geyser", "Geyser malfunction - no hot water supply. Inspection needed."),
                ("Kitchen drain is completely blocked", "Kitchen drainage system blockage. Professional cleaning required.")
            ],
            "Hinglish": [
                ("Yaar bathroom ke neeche se paani leak ho raha continuously", "Continuous water leakage detected below bathroom. Plumbing work required."),
                ("Kitchen ka drain full block ho gaya hai boss", "Kitchen drainage completely blocked. Professional plumber needed."),
                ("Flush bilkul kaam nahi kar raha bro", "Toilet flush not functioning. Repair work required immediately."),
                ("Geyser se sirf thanda paani aa raha hai", "Geyser not heating water. Technical fault - inspection required.")
            ]
        },
        "Electrical": {
            "Hindi": [
                ("Light jal nahi rahi hai bedroom mein", "Bedroom light not functioning. Electrical inspection required."),
                ("Socket kaam nahi kar raha hai", "Power socket malfunction. Electrician needed."),
                ("Fan awaaz kar raha hai bahut zyada", "Ceiling fan making excessive noise. Repair/replacement needed."),
                ("MCB baar baar gir raha hai", "MCB tripping repeatedly. Electrical circuit check required."),
                ("Doorbell ki awaaz nahi aa rahi", "Doorbell not functioning. Repair needed.")
            ],
            "Marathi": [
                ("Light jali nahi bedroom madhe", "Bedroom light not working. Electrical repair needed."),
                ("Socket kaam karat nahi", "Power socket not functioning. Electrician required."),
                ("Pankha khup awaaz karto", "Ceiling fan making loud noise. Servicing required."),
                ("MCB uthun uthun padto", "MCB tripping frequently. Circuit inspection needed."),
                ("Doorbell vaajat nahi", "Doorbell malfunction. Repair work needed.")
            ],
            "English": [
                ("The bedroom light is not working", "Bedroom light fixture malfunction. Electrical repair required."),
                ("Power socket has stopped functioning", "Power socket failure. Electrician assistance needed."),
                ("Fan is making strange noises", "Ceiling fan noise issue. Bearing/motor check required."),
                ("Main switch keeps tripping", "MCB tripping repeatedly. Electrical circuit overload suspected."),
                ("Doorbell button not responding", "Doorbell system failure. Wiring check and repair needed.")
            ],
            "Hinglish": [
                ("Yaar light nahi aa rahi room mein", "Room light not functioning. Electrical repair needed."),
                ("Socket totally dead hai bhai", "Power socket completely non-functional. Electrician required."),
                ("Fan bohot zyada awaaz kar raha boss", "Ceiling fan excessive noise. Servicing/replacement needed."),
                ("MCB har roz trip ho raha hai yaar", "MCB tripping daily. Electrical load/circuit check required.")
            ]
        },
        "Lift": {
            "Hindi": [
                ("Lift band pada hai", "Lift not operational. Urgent repair required."),
                ("Lift ka darwaza theek se band nahi hota", "Lift door not closing properly. Safety hazard - immediate attention needed."),
                ("Lift mein bahut awaaz aa rahi hai", "Lift making abnormal noise. Technical inspection required."),
                ("Lift floors ke beech mein ruk gayi", "Lift stuck between floors. Emergency rescue and repair needed."),
                ("Lift ki light off hai andar", "Lift cabin light not working. Replacement required.")
            ],
            "Marathi": [
                ("Lift band padli ahe", "Lift out of service. Repair work needed urgently."),
                ("Lift cha darwaza properly band hot nahi", "Lift door malfunction. Safety issue - immediate repair required."),
                ("Lift madhun khup awaaz yetoy", "Lift making excessive noise. Technical check needed."),
                ("Lift floors madhye thambli ahe", "Lift stuck between floors. Emergency assistance required."),
                ("Lift madhe light nahi ahe", "Lift cabin light not functioning. Bulb replacement needed.")
            ],
            "English": [
                ("The lift has completely stopped working", "Lift complete breakdown. Urgent technical repair required."),
                ("Lift door sensor is not working", "Lift door sensor malfunction. Safety risk - immediate repair needed."),
                ("Very loud grinding noise from lift", "Lift mechanical noise - possible motor/pulley issue. Inspection required."),
                ("Lift got stuck with people inside", "Lift emergency - stuck with passengers. Immediate rescue needed."),
                ("Lift shows wrong floor numbers", "Lift indicator malfunction. Calibration/repair required.")
            ],
            "Hinglish": [
                ("Yaar lift full kharab hai", "Lift completely non-operational. Urgent repair required."),
                ("Lift ka door properly close nahi hota boss", "Lift door not closing properly. Safety hazard - fix needed."),
                ("Lift mein bahut weird awaaz aa rahi hai bhai", "Lift making abnormal sounds. Technical inspection required."),
                ("Lift beech mein hi atak gayi thi", "Lift stuck mid-floor. Emergency repair and safety check needed.")
            ]
        },
        "Security": {
            "Hindi": [
                ("Anjan aadmi basement mein dikha", "Unknown person spotted in basement. Security alert."),
                ("CCTV camera kaam nahi kar raha", "CCTV camera malfunction. Repair needed for security monitoring."),
                ("Security guard gate pe nahi dikh raha", "Security guard absent from post. Duty negligence issue."),
                ("Koi bina entry ke aa gaya andar", "Unauthorized entry detected. Security protocol breach."),
                ("Anjan gaadi park hai society mein", "Unregistered vehicle parked in society. Security check required.")
            ],
            "Marathi": [
                ("Olakhit vyakti basement madhe dikli", "Unknown person seen in basement area. Security concern."),
                ("CCTV camera kaam karat nahi", "CCTV camera not functioning. Security monitoring affected."),
                ("Security guard duty var nahi hota", "Security guard not on duty. Negligence reported."),
                ("Koni verify n karta andar aala", "Person entered without verification. Security lapse."),
                ("Mahit nahi aslelya gadi park ahe", "Unknown vehicle parked in premises. Security check needed.")
            ],
            "English": [
                ("Unknown person was roaming in the basement", "Suspicious person spotted in basement. Security alert and investigation needed."),
                ("CCTV in our corridor is not working", "CCTV camera malfunction. Security vulnerability - urgent repair required."),
                ("Security guard was sleeping on duty", "Security guard negligence during duty hours. Disciplinary action required."),
                ("Someone entered without proper checking", "Unauthorized entry - security protocol violation. Staff training needed."),
                ("Unregistered vehicle parked for many days", "Abandoned/unauthorized vehicle in society. Removal and security check required.")
            ],
            "Hinglish": [
                ("Bhai koi anjan banda basement mein tha", "Unknown person in basement area. Security threat - investigation needed."),
                ("CCTV toh bilkul kaam hi nahi karta yaar", "CCTV system not functioning. Security monitoring disrupted - repair needed."),
                ("Security guard so raha tha duty pe boss", "Security guard sleeping on duty. Serious negligence - action required."),
                ("Bina check kiye koi bhi andar aa jata hai", "Entry without verification happening. Security protocol enforcement needed.")
            ]
        },
        "Parking": {
            "Hindi": [
                ("Mere parking mein kisi ki gaadi khadi hai", "Unauthorized vehicle in my parking slot. Removal required."),
                ("Parking area mein paani bhara hua hai", "Parking area waterlogged. Drainage issue - urgent attention needed."),
                ("Guest parking hamesha full rehta hai", "Guest parking always full. Additional space allocation needed."),
                ("Parking ka number dikhai nahi deta", "Parking slot number faded. Repainting required."),
                ("Kisi ne meri gaadi ko scratch kar diya", "Vehicle scratched in parking. CCTV check and complaint registration needed.")
            ],
            "Marathi": [
                ("Majhya parking madhe dusryachi gaadi ahe", "Someone else's vehicle in my parking. Removal required."),
                ("Parking area madhe paani jamla ahe", "Water accumulation in parking. Drainage cleaning needed."),
                ("Guest parking завжди full ahe", "Guest parking always occupied. Space management issue."),
                ("Parking number dikhat nahi", "Parking slot marking not visible. Repainting needed."),
                ("Koni majhi gaadi scratch keli", "Vehicle scratched in parking. Investigation required.")
            ],
            "English": [
                ("Someone has parked in my reserved slot", "Parking slot encroachment. Unauthorized vehicle removal required."),
                ("Parking area is completely flooded", "Parking waterlogging issue. Drainage system repair needed urgently."),
                ("No guest parking space available ever", "Guest parking shortage. Space allocation review required."),
                ("My parking number is completely faded", "Parking slot marking worn out. Repainting and number display needed."),
                ("My car was scratched by another vehicle", "Vehicle damage in parking. CCTV review and investigation required.")
            ],
            "Hinglish": [
                ("Yaar mere slot mein kisi ne gaadi park kar di", "My parking slot occupied by unauthorized vehicle. Removal needed."),
                ("Parking full paani se bhara pada hai boss", "Parking area severely waterlogged. Drainage repair urgent."),
                ("Guest parking mein kabhi jagah hi nahi milti", "Guest parking perpetually full. Capacity issue - review needed."),
                ("Parking number toh saaf dikhai hi nahi deta", "Parking slot number completely faded. Repainting required.")
            ]
        },
        "Housekeeping": {
            "Hindi": [
                ("Kachra collect nahi hua aaj", "Garbage not collected today. Housekeeping lapse."),
                ("Seedhi bahut gandi hai", "Staircase very dirty. Cleaning required urgently."),
                ("Lift ke andar buri smell aa rahi hai", "Foul odor in lift cabin. Deep cleaning needed."),
                ("Dustbin overflow ho raha hai", "Dustbin overflowing in common area. Immediate attention required."),
                ("Sweeper time pe nahi aata", "Housekeeping staff coming late regularly. Discipline issue.")
            ],
            "Marathi": [
                ("Aaj kachra collect jhala nahi", "Garbage collection missed today. Housekeeping follow-up needed."),
                ("Jina khup ghaan ahet", "Staircases very dirty. Cleaning work pending."),
                ("Lift madhun vaas yetoy", "Bad smell from lift. Cleaning and sanitization required."),
                ("Dustbin bharun vat ahe", "Dustbin overflow in common area. Disposal needed urgently."),
                ("Safai karmachari velever yet nahi", "Housekeeping staff not punctual. Attendance issue.")
            ],
            "English": [
                ("Garbage was not collected from our floor", "Missed garbage collection. Housekeeping service lapse."),
                ("Staircase has not been cleaned for days", "Staircase cleaning neglected. Hygiene concern - immediate action needed."),
                ("Very bad smell coming from the lift", "Lift cabin odor problem. Deep cleaning and sanitization required."),
                ("Common area dustbin is overflowing", "Dustbin overflow creating unhygienic conditions. Urgent disposal needed."),
                ("Cleaning staff not doing job properly", "Housekeeping quality issue. Staff training/supervision required.")
            ],
            "Hinglish": [
                ("Aaj garbage collect hi nahi hua bhai", "Garbage collection missed today. Housekeeping follow-up required."),
                ("Staircase kitna ganda hai yaar", "Staircase extremely dirty. Cleaning urgently needed."),
                ("Lift mein bohot buri smell aa rahi boss", "Strong foul odor in lift. Deep cleaning required immediately."),
                ("Dustbin pura overflow ho raha hai", "Dustbin completely overflowing. Urgent disposal needed.")
            ]
        },
        "Noise": {
            "Hindi": [
                ("Pados wale raat ko bahut shor machate hain", "Neighbor making excessive noise at night. Noise pollution complaint."),
                ("Upar wale flat mein construction chal raha hai", "Construction work in upper flat causing disturbance. Noise violation during restricted hours."),
                ("Raat ko bahut loud music bajta hai", "Loud music at night. Noise policy violation - action required."),
                ("Kutte ki awaaz se neend nahi aati", "Dog barking throughout night. Pet noise nuisance."),
                ("Generator ki awaaz bahut zyada hai", "Generator excessive noise. Acoustic treatment or relocation needed.")
            ],
            "Marathi": [
                ("Shejari ratra khup golla kartat", "Neighbor creating noise at night. Noise disturbance complaint."),
                ("Varchya flat madhe construction challay", "Construction work upstairs during quiet hours. Violation reported."),
                ("Ratra khup jor jor music vaajtay", "Very loud music at night. Noise rules violation."),
                ("Kutrya bhunkun zhop yet nahi", "Dog barking preventing sleep. Pet noise issue."),
                ("Generator cha awaaz khoopch jast ahe", "Generator noise excessive. Mitigation required.")
            ],
            "English": [
                ("Neighbor playing very loud music at midnight", "Late night noise disturbance. Quiet hours violation - intervention needed."),
                ("Construction work happening during afternoon quiet time", "Renovation work during restricted hours. Policy violation - action required."),
                ("Dogs barking continuously throughout the night", "Persistent dog barking at night. Pet owner counseling needed."),
                ("Party in neighboring flat went on till 3 AM", "Late night party noise. Serious quiet hours violation reported."),
                ("Heavy furniture dragging noise at odd hours", "Noise disturbance from moving furniture. Request compliance with timings.")
            ],
            "Hinglish": [
                ("Neighbor raat bhar loud music bajata hai yaar", "Neighbor playing loud music all night. Noise violation - action needed."),
                ("Upar wale construction kar rahe quiet hours mein boss", "Upstairs construction during restricted hours. Policy violation reported."),
                ("Kutte ek dum raat bhar bhaunkte rehte hain", "Dogs barking entire night. Pet noise nuisance - owner counseling required."),
                ("Party 2 baje tak chal rahi thi unke flat mein", "Party until 2 AM creating disturbance. Severe quiet hours violation.")
            ]
        }
    }
    
    voice_complaints_list = []
    
    categories = list(voice_complaints_templates.keys())
    
    for i in range(count):
        category = random.choice(categories)
        languages = list(voice_complaints_templates[category].keys())
        language = random.choice(languages)
        
        spoken, formal = random.choice(voice_complaints_templates[category][language])
        
        # Determine priority based on keywords
        priority = "Medium"
        if any(word in spoken.lower() for word in ["urgent", "emergency", "stuck", "leakage", "theft"]):
            priority = "High"
        elif any(word in spoken.lower() for word in ["critical", "dangerous", "fire", "injury"]):
            priority = "Critical"
        elif any(word in spoken.lower() for word in ["dirty", "smell", "faded", "scratched"]):
            priority = "Low"
        
        voice_complaint = {
            "spoken_complaint": spoken,
            "category": category,
            "priority": priority,
            "formal_ticket": formal
        }
        
        voice_complaints_list.append(voice_complaint)
    
    # Write to JSON
    with open('voice_complaints.json', 'w', encoding='utf-8') as jsonfile:
        json.dump(voice_complaints_list, jsonfile, ensure_ascii=False, indent=2)
    
    return voice_complaints_list

print("Generating 2000 Voice-style Complaints JSON...")
voice_complaints = generate_voice_complaints_json(2000)
print("✓ Voice complaints saved to voice_complaints.json")

print("\n" + "="*60)
print("ALL DATASETS GENERATED SUCCESSFULLY!")
print("="*60)
print("\nFiles created:")
print("1. agm_minutes_raw.txt - 100 AGM minutes documents")
print("2. society_notices_raw.txt - 500 society notices")
print("3. society_circulars_raw.txt - 300 society circulars")
print("4. housing_society_complaints.csv - 5000 complaints")
print("5. voice_complaints.json - 2000 voice-style complaints")
print("\n✓ All datasets ready for RAG system training!")
