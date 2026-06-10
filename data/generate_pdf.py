from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import re
import os


raw_text = r"""
**Document Type:** Society Rule Book
**Society Name:** Green Meadows CHS Ltd.
**Date:** 12 January 2026
**Content:**
**Author/Committee:** Managing Committee, Green Meadows
**Overview:** This Rule Book governs the daily operations and resident conduct within Green Meadows CHS to ensure harmony and safety.
**Rules:**
1. All residents must register their tenants with the local police station and society office before move-in.
2. Maintenance dues must be cleared by the 10th of every month.
3. Common areas (corridors, lobbies) must not be used for storing personal items like shoe racks or bicycles.
**Important Clauses:**
- Clause 4A: Subletting without prior NOC from the society is strictly prohibited.
- Clause 12B: The society reserves the right to levy penalties of ₹500/day for structural damages caused during unauthorized renovations.
**FAQs:**
- *Q: Where can I get the tenant registration forms?* A: Forms are available at the society office during working hours (10 AM - 1 PM) or on the society portal.
**Contact Information:** manager@greenmeadows.in | 022-2456-7890

***

**Document Type:** Pet Policy
**Society Name:** Sapphire Heights Cooperative Housing Society
**Date:** 05 March 2026
**Content:**
**Author/Committee:** Animal Welfare Subcommittee
**Overview:** Sapphire Heights welcomes pets but requires owners to maintain hygiene and ensure their pets do not cause a nuisance to neighbors.
**Rules:**
1. All pets (dogs/cats) must be vaccinated annually, and a copy of the vaccination card must be submitted to the society office.
2. Pets must be on a leash not exceeding 6 feet while in common areas.
3. Pet owners are responsible for immediately cleaning up their pet's excreta in common areas or the society garden.
**Important Clauses:**
- Clause 3: The society cannot ban pets or use of lifts by pets, as per Animal Welfare Board of India (AWBI) guidelines.
- Clause 4: Aggressive behavior by pets leading to injury will result in municipal authorities being notified.
**FAQs:**
- *Q: Can I take my dog in the passenger lift?* A: Yes, but please give preference to senior citizens or those uncomfortable around animals.
**Contact Information:** pets@sapphireheights.com | +91-9876543210

***

**Document Type:** Parking Policy
**Society Name:** Vasant Vihar Apartments
**Date:** 20 April 2026
**Content:**
**Author/Committee:** Parking & Security Committee
**Overview:** Guidelines for the allocation, usage, and management of parking spaces within the society premises.
**Rules:**
1. Parking is strictly restricted to the allotted slots marked with the flat number.
2. Guest parking is available on a first-come, first-served basis for a maximum of 6 hours.
3. Vehicles without society RFID tags will not be allowed past the boom barrier.
**Important Clauses:**
- Clause 5.1: Renting out parking spaces to non-residents is completely banned.
- Clause 7.2: Abandoned vehicles parked for over 30 days without notice will be towed at the owner's expense.
**FAQs:**
- *Q: How do I apply for a second parking spot?* A: Open parking spots are auctioned annually at the AGM. Check the notice board for updates.
**Contact Information:** security@vasantviharapts.in | Extension 101

***

**Document Type:** Visitor Management Policy
**Society Name:** Royal Enclave CHS
**Date:** 15 May 2026
**Content:**
**Author/Committee:** Security Administration
**Overview:** To ensure the safety of all residents, strict visitor entry protocols are enforced using the society's digital gatekeeping app.
**Rules:**
1. All visitors must be pre-approved via the MyGate/NoBrokerHood app or confirmed via intercom.
2. Delivery executives must park in the designated zones and cannot wander in the basement.
3. Visitors staying overnight must be logged in the 'Overnight Guest' register at the main gate.
**Important Clauses:**
- Clause 2.1: Security guards have the right to inspect large bags/packages leaving the premises with visitors.
- Clause 4.3: Unverified visitors will be denied entry after 10:00 PM without exception.
**FAQs:**
- *Q: What if the intercom is dead and I don't use the app?* A: The guard will personally escort the visitor to your door for verification.
**Contact Information:** royal.security@gmail.com | Gate 1: 080-1234-5678

***

**Document Type:** Renovation & Structural Alteration Policy
**Society Name:** Palm Grove Residences
**Date:** 02 June 2026
**Content:**
**Author/Committee:** Estate Management Committee
**Overview:** Guidelines to ensure that civil work within individual flats does not compromise the building's structural integrity or disturb neighbors.
**Rules:**
1. Renovation timings: 9:00 AM to 5:00 PM, Monday to Saturday. No noisy work on Sundays and public holidays.
2. Debris must be removed within 24 hours and cannot be dumped in society bins.
3. A refundable deposit of ₹25,000 must be submitted before commencing work.
**Important Clauses:**
- Clause B: Alteration of load-bearing walls or external elevation (including painting balconies a different color) is strictly prohibited.
- Clause D: The society engineer will inspect the premises pre- and post-renovation.
**FAQs:**
- *Q: Do I need an NOC for simple painting?* A: No, minor work like painting or modular kitchen installation doesn't require an NOC, but gate passes for workers are needed.
**Contact Information:** estate@palmgrove.in | +91-8888888888

***

**Document Type:** Community Hall Usage Policy
**Society Name:** Orchid Petals Society
**Date:** 10 June 2026
**Content:**
**Author/Committee:** Cultural Committee
**Overview:** Rules for booking and using the society's multipurpose community hall for private events.
**Rules:**
1. The hall can be booked by residents only. Commercial exhibitions are not allowed.
2. Maximum capacity is 150 guests.
3. Loud music/DJ must be stopped strictly by 10:00 PM as per municipal laws.
**Important Clauses:**
- Clause 1.1: Booking charges are ₹5,000 per day plus ₹2,000 cleaning deposit.
- Clause 3.4: Cooking inside the hall is banned; caterers must use the designated outdoor pantry area.
**FAQs:**
- *Q: Can I serve alcohol at my private party?* A: Yes, but only inside the hall, and a one-day liquor license must be obtained from the state excise department.
**Contact Information:** cultural.orchid@society.com | 022-2765-4321

***

**Document Type:** Clubhouse Rules
**Society Name:** The Imperial Towers
**Date:** 18 July 2026
**Content:**
**Author/Committee:** Clubhouse Management
**Overview:** Guidelines to maintain the decorum and facilities of the Imperial Clubhouse.
**Rules:**
1. Entry is restricted to residents and a maximum of 2 guests per flat.
2. Proper attire is mandatory (no wet swimming clothes in the lounge area).
3. Children under 12 must be accompanied by an adult.
**Important Clauses:**
- Clause 5: Consumption of outside food and beverages is restricted to the cafeteria zone.
- Clause 6: Willful damage to pool tables, TT tables, or furniture will be billed to the resident's maintenance account.
**FAQs:**
- *Q: What are the operating hours?* A: 6:00 AM to 11:00 PM daily. Closed on Mondays for deep cleaning.
**Contact Information:** club.imperial@towers.in | Ext. 202

***

**Document Type:** Swimming Pool Rules
**Society Name:** Whispering Willows CHS
**Date:** 01 August 2026
**Content:**
**Author/Committee:** Sports & Recreation Committee
**Overview:** Safety and hygiene protocols for utilizing the society swimming pool.
**Rules:**
1. Showering before entering the pool is mandatory.
2. Appropriate synthetic swimwear and swimming caps (for long hair) are compulsory. Cotton clothes are not allowed.
3. Diving is strictly prohibited as pool depth is only 5 feet.
**Important Clauses:**
- Clause 2: Persons with open wounds, skin infections, or contagious diseases are barred from entering the pool.
- Clause 8: The society is not liable for accidents; residents swim at their own risk. Lifeguard instructions are final.
**FAQs:**
- *Q: Can my guests use the pool?* A: Yes, guest passes are available for ₹100 per session, payable at the club desk.
**Contact Information:** recreation@whisperingwillows.com | +91-9999999999

***

**Document Type:** Gym Usage Policy
**Society Name:** Skyline Residency
**Date:** 12 September 2026
**Content:**
**Author/Committee:** Fitness Committee
**Overview:** Rules ensuring safe and equitable access to the society's gymnasium.
**Rules:**
1. Wipe down equipment with the provided sanitizing spray after use.
2. Re-rack all dumbbells and weights; do not drop weights on the floor.
3. Limit treadmill/cardio use to 20 minutes during peak hours (6 AM - 8 AM and 6 PM - 8 PM).
**Important Clauses:**
- Clause 3: Personal trainers from outside are allowed only if registered with the society and paying the monthly vendor fee.
- Clause 5: Children below 16 years are strictly prohibited from entering the gym for safety reasons.
**FAQs:**
- *Q: Do I need a separate membership for the gym?* A: No, gym access is included in your monthly maintenance fee.
**Contact Information:** fitness@skylineresidency.in | Ext. 303

***

**Document Type:** Fire Safety SOP
**Society Name:** Harmony Heights
**Date:** 25 October 2026
**Content:**
**Author/Committee:** Safety & Disaster Management Committee
**Overview:** Standard Operating Procedures to prevent fire hazards and actions to take during a fire emergency.
**Rules:**
1. Do not store combustible materials (gas cylinders, paints) in electrical shafts or staircases.
2. Fire doors on every floor must be kept closed at all times (not locked).
3. Ensure your flat's smoke detectors and sprinklers are unobstructed.
**Important Clauses:**
- Clause 1: Tampering with fire extinguishers or hose reels will attract a penalty of ₹10,000.
- Clause 4: Fire mock drills are mandatory; at least one representative per flat must attend the bi-annual drill.
**FAQs:**
- *Q: What do I do if I hear the fire alarm?* A: Immediately evacuate using the stairs. DO NOT use the lift. Assemble at the designated safe zone near the main gate.
**Contact Information:** safety@harmonyheights.com | Fire Brigade: 101

***

**Document Type:** Emergency Response Procedure
**Society Name:** Silver Oaks Apartment Owners Association
**Date:** 05 November 2026
**Content:**
**Author/Committee:** Emergency Task Force
**Overview:** Protocols for medical, structural, and natural disaster emergencies.
**Rules:**
1. In a medical emergency, notify the main gate to arrange quick access for ambulances.
2. Keep an emergency kit (torch, first-aid, medicines) in your home.
3. During earthquakes, do not run down the stairs during tremors; drop, cover, and hold on.
**Important Clauses:**
- Clause A: Security guards are trained in basic CPR and first-aid; contact them immediately.
- Clause C: The society maintains a wheelchair and stretcher in the ground floor lobby for emergency use.
**FAQs:**
- *Q: Is there a doctor on call?* A: Yes, Dr. Sharma (Flat 402) has volunteered to assist in emergencies. Call security to reach him.
**Contact Information:** emergency@silveroaks.in | Ambulance: 108

***

**Document Type:** Waste Management Policy
**Society Name:** Eco-Village CHS
**Date:** 10 December 2026
**Content:**
**Author/Committee:** Green Initiative Committee
**Overview:** Strict adherence to municipal solid waste segregation guidelines.
**Rules:**
1. Waste must be segregated at source into Wet (Green bin), Dry (Blue bin), and Hazardous/Medical (Red bin).
2. Housekeeping staff will collect garbage from doorsteps daily between 7:30 AM and 9:00 AM.
3. E-waste must be deposited in the designated e-waste drop box in the basement.
**Important Clauses:**
- Clause 2.2: Mixed garbage will NOT be collected. Repeat offenders will be fined ₹500 per instance.
- Clause 4: Wet waste is processed in the society's organic composter; please avoid mixing plastics or metals in it.
**FAQs:**
- *Q: Where do I dispose of old furniture?* A: Bulk waste must be disposed of personally by contacting local scrap dealers. Housekeeping will not take it.
**Contact Information:** green@ecovillage.org | +91-7777777777

***

**Document Type:** Security Guidelines
**Society Name:** Golden Gate Apartments
**Date:** 15 January 2026
**Content:**
**Author/Committee:** Security Committee
**Overview:** General safety protocols for residents and staff to maintain a secure perimeter.
**Rules:**
1. Residents should inform security if their flat will be locked and vacant for more than 7 days.
2. Do not employ any domestic help without a background check and police verification.
3. Report any suspicious individuals loitering in the basement or corridors immediately.
**Important Clauses:**
- Clause 6: CCTV footage can only be reviewed by the Managing Committee or police officials in case of an incident. It is not accessible to individuals for personal disputes.
- Clause 9: Tailgating through the boom barrier is strictly forbidden and dangerous.
**FAQs:**
- *Q: How do I register a new maid for gate access?* A: Submit her Aadhar card copy, 2 photos, and police verification form to the manager's office.
**Contact Information:** admin@goldengate.com | Chief Security Officer: 09988776655

***

**Document Type:** Noise Complaint Policy
**Society Name:** Serene Waters Society
**Date:** 20 February 2026
**Content:**
**Author/Committee:** Grievance Redressal Cell
**Overview:** Guidelines for maintaining peaceful coexistence and handling noise-related disputes.
**Rules:**
1. "Quiet Hours" are designated from 10:30 PM to 6:30 AM daily, and 2:00 PM to 4:00 PM.
2. Moving heavy furniture, drilling, and loud music are prohibited during quiet hours.
3. Complaints should first be addressed amicably between neighbors before escalating to the committee.
**Important Clauses:**
- Clause 3: If a noise complaint is verified by security after 11 PM, a formal warning letter will be issued.
- Clause 5: Continuous disregard for noise rules will result in police intervention for public nuisance.
**FAQs:**
- *Q: I work night shifts and my neighbor's kids are loud in the afternoon. What can I do?* A: Afternoon quiet hours (2-4 PM) apply. Kindly speak to them or notify the estate manager to mediate.
**Contact Information:** grievances@serenewaters.in | Manager: 011-2233-4455

***

**Document Type:** Maintenance Charge Policy
**Society Name:** Pearl Residency
**Date:** 10 March 2026
**Content:**
**Author/Committee:** Treasurer & Accounts Committee
**Overview:** Structure and regulations regarding the collection of monthly society maintenance dues.
**Rules:**
1. Maintenance bills are generated on the 1st of every month and emailed to registered IDs.
2. Payment is due by the 15th of the month.
3. Payments can be made via UPI, NEFT, or cheques dropped in the society drop-box. Cash is not accepted.
**Important Clauses:**
- Clause 2: Maintenance is charged at ₹3.50 per sq. ft. of super built-up area.
- Clause 4: A late payment interest of 18% p.a. simple interest will be levied on dues paid after the 15th.
**FAQs:**
- *Q: I didn't receive my bill this month. Do I still pay?* A: Yes, non-receipt of the bill is not an excuse. Dues remain constant. Check your app for the ledger.
**Contact Information:** accounts@pearlresidency.co.in | 080-8765-4321

***

**Document Type:** Non-Payment Recovery Policy
**Society Name:** Sunrise Enclave
**Date:** 05 April 2026
**Content:**
**Author/Committee:** Managing Committee
**Overview:** Procedures for recovering long-pending maintenance dues from defaulting members.
**Rules:**
1. A reminder notice will be sent after 30 days of default.
2. A formal legal show-cause notice will be issued after 90 days of non-payment.
3. Defaulters will be barred from using non-essential amenities (clubhouse, pool, gym) after 60 days.
**Important Clauses:**
- Clause A: Under Section 101 of the MCS Act, the society can initiate legal recovery proceedings, including attaching the flat, for dues exceeding 6 months.
- Clause C: Names of defaulters owing more than ₹20,000 will be published on the society notice board.
**FAQs:**
- *Q: Will my water or electricity be cut off?* A: The society will not disconnect essential services like water, but parking privileges and club access will be suspended.
**Contact Information:** secretary@sunriseenclave.com | Legal Cell: Ext. 405

***

**Document Type:** Vendor Registration Policy
**Society Name:** The Pinnacle CHS
**Date:** 25 May 2026
**Content:**
**Author/Committee:** Estate Management
**Overview:** Guidelines for onboarding local vendors (milkmen, newspaper delivery, car washers, broadband providers).
**Rules:**
1. All regular vendors must be registered with the society office and carry a valid ID card issued by us.
2. Car washing is permitted only between 6:00 AM and 10:00 AM.
3. Vendors must renew their society IDs every 6 months.
**Important Clauses:**
- Clause 3: Vendors caught soliciting or roaming on unauthorized floors will be permanently banned from the premises.
- Clause 6: A monthly vendor access fee of ₹100 applies to commercial service providers.
**FAQs:**
- *Q: Can my car washer use society water?* A: Yes, but only two buckets per car. Hoses are strictly prohibited to conserve water.
**Contact Information:** admin@thepinnacle.in | +91-9898989898

***

**Document Type:** Maid and Domestic Staff Policy
**Society Name:** Lotus Boulevard
**Date:** 12 June 2026
**Content:**
**Author/Committee:** Security & Welfare Committee
**Overview:** Regulations managing the entry, conduct, and facilities for domestic helpers and cooks.
**Rules:**
1. All staff must use the service lifts and service entrances exclusively.
2. Domestic staff must wait in the designated basement waiting area, not in lobby corridors.
3. Residents are entirely responsible for the conduct of the staff they employ.
**Important Clauses:**
- Clause 2: The society mandates an annual health checkup camp for all registered domestic staff, subsidized by the committee.
- Clause 5: Misbehavior or theft will result in blacklisting the individual across the society.
**FAQs:**
- *Q: Can my maid use the common washrooms?* A: Yes, designated staff washrooms are available in the basement of every tower.
**Contact Information:** welfare@lotusboulevard.com | Ext. 109

***

**Document Type:** Delivery Partner Entry Rules
**Society Name:** Crystal Heights
**Date:** 28 July 2026
**Content:**
**Author/Committee:** Main Gate Security
**Overview:** Rules for Swiggy, Zomato, Amazon, and other delivery personnel.
**Rules:**
1. Delivery executives must park in the demarcated "Delivery Zone" outside the gate.
2. Helmets must be removed before entering the lobby for CCTV face capture.
3. "Leave at gate" protocol is activated automatically post 11:30 PM. No deliveries to doors after midnight.
**Important Clauses:**
- Clause 1: Delivery personnel are permitted only 15 minutes of turnaround time. Prolonged stays will trigger a security check.
- Clause 4: Residents must update their app if a delivery is expected to avoid gate congestion.
**FAQs:**
- *Q: Can I get heavy furniture delivered on Sunday?* A: No, heavy deliveries requiring service lift padding are only allowed Mon-Sat.
**Contact Information:** crystal.gate@security.in | 044-1122-3344

***

**Document Type:** Festival Celebration Guidelines
**Society Name:** Shanti Vihar Apartments
**Date:** 15 August 2026
**Content:**
**Author/Committee:** Cultural Sub-Committee
**Overview:** Framework for celebrating festivals (Diwali, Holi, Ganesh Chaturthi) safely and inclusively.
**Rules:**
1. Bursting of firecrackers is allowed only in the central ground between 8 PM and 10 PM on Diwali.
2. During Holi, only dry organic colors are allowed in the common areas. Water balloons are banned.
3. Chanda (donations) for society festivals are strictly voluntary.
**Important Clauses:**
- Clause C: Personal pandals or installations in common corridors are not permitted as they obstruct fire exits.
- Clause D: Noise levels during Garba/Ganesh immersion must adhere to municipal decibel limits.
**FAQs:**
- *Q: How can I volunteer for the upcoming Durga Puja event?* A: Please drop an email to the cultural committee or sign up on the notice board sheet.
**Contact Information:** festivals@shantivihar.co.in | +91-9123456789

***

**Document Type:** AGM Minutes
**Society Name:** Hillview Cooperative Housing Society
**Date:** 20 September 2026
**Content:**
**Author/Committee:** Managing Committee (Secretary)
**Overview:** Minutes of the 14th Annual General Meeting held on 15th Sept 2026.
**Rules/Resolutions:**
1. Resolution Passed: Increase in maintenance by ₹0.50/sq.ft. effective next quarter.
2. Resolution Passed: Appointment of M/s Sharma & Associates as Statutory Auditors for FY 26-27.
3. Resolution Deferred: Proposal for rooftop solar installation deferred pending structural audit.
**Important Clauses:**
- Clause 2.1: The audited financials for FY 25-26 were adopted unanimously with a quorum of 55 members present.
- Clause 5: The outgoing committee handed over charge to the newly elected body.
**FAQs:**
- *Q: I couldn't attend. When does the new maintenance rate apply?* A: The new rate applies from October 1st, 2026.
**Contact Information:** secretary@hillviewchs.in | Office: 022-5555-6666

***

**Document Type:** Special General Meeting Minutes
**Society Name:** Maple Woods Enclave
**Date:** 10 October 2026
**Content:**
**Author/Committee:** Managing Committee
**Overview:** Minutes of the SGM called specifically to address the major lift replacement project.
**Rules/Resolutions:**
1. Members unanimously agreed to utilize ₹50 Lakhs from the Sinking Fund for replacing two passenger lifts in Tower A.
2. Vendor Kone Elevators was selected based on a majority vote (78 in favor, 12 against).
3. A special sub-committee was formed to oversee the installation timeline.
**Important Clauses:**
- Clause 1: As per bye-laws, sinking funds can only be utilized with SGM approval.
- Clause 3: Work will commence in December and take 45 days per lift.
**FAQs:**
- *Q: Will both lifts be down at the same time?* A: No, to minimize inconvenience, one lift will be operational while the other is replaced.
**Contact Information:** sgm@maplewoods.in | +91-9000000001

***

**Document Type:** Circulars
**Society Name:** Banyan Tree Residences
**Date:** 01 November 2026
**Content:**
**Author/Committee:** Estate Manager
**Overview:** Mandatory Pest Control Drive
**Rules:**
1. Society-wide anti-termite and fogging treatment will take place on Nov 5th and 6th.
2. Residents must clear out the area under their kitchen sinks.
3. Keep windows open during fogging (between 5 PM - 6 PM) to ensure mosquitoes are driven out.
**Important Clauses:**
- Clause A: If you are unavailable on these dates, please leave your keys with a neighbor; the vendor will not return for individual flats.
- Clause B: The chemicals used are certified pet-safe, but keep pets out of the room being sprayed for 15 minutes.
**FAQs:**
- *Q: Is there an extra charge for this?* A: No, this is covered under the annual maintenance contract.
**Contact Information:** manager@banyantree.org | Ext. 001

***

**Document Type:** Notices
**Society Name:** Ocean View CHS
**Date:** 12 November 2026
**Content:**
**Author/Committee:** Managing Committee
**Overview:** Strict Warning Against Pigeon Feeding
**Rules:**
1. Feeding pigeons from balconies or windows is strictly prohibited.
2. Bird nets must be installed by residents facing the sea.
3. Throwing food scraps out of the window is a severe health and hygiene violation.
**Important Clauses:**
- Clause 1: Droppings cause respiratory issues and property damage. A fine of ₹1,000 will be imposed on residents caught feeding pigeons.
- Clause 2: Repeat offenders will be reported to the municipal health officer.
**FAQs:**
- *Q: Can I keep a bird feeder for sparrows?* A: Small hanging feeders for sparrows inside your enclosed balcony are fine, but throwing grains on ledges is banned.
**Contact Information:** admin@oceanview.in | +91-8888111122

***

**Document Type:** Water Shutdown Notice
**Society Name:** Desert Rose Apartments
**Date:** 20 November 2026
**Content:**
**Author/Committee:** Maintenance Department
**Overview:** Scheduled interruption of water supply for overhead tank cleaning.
**Rules:**
1. Water supply will be unavailable from 10:00 AM to 4:00 PM on Wednesday, Nov 25th.
2. Please store sufficient water for drinking and sanitation purposes in advance.
3. Do not run washing machines or dishwashers during this period to avoid motor burnout.
**Important Clauses:**
- Clause 2: The shutdown affects all towers. RO plants in the kitchen will also not receive input water.
- Clause 3: Supply may resume earlier if work is completed ahead of schedule.
**FAQs:**
- *Q: Will flushing work?* A: Residual water in your flush tank will work once, but no refill will happen until 4 PM.
**Contact Information:** plumbing@desertrose.com | Helpdesk: Ext. 444

***

**Document Type:** Lift Maintenance Notice
**Society Name:** Zenith Towers
**Date:** 02 December 2026
**Content:**
**Author/Committee:** Facilities Management
**Overview:** Routine servicing of the Service Elevator.
**Rules:**
1. The service lift (Lift No. 3) will be out of order for mandatory wire rope inspection on Dec 5th from 11:00 PM to 4:00 AM.
2. No heavy shifting or garbage collection will be permitted during these hours.
3. Use passenger lifts 1 and 2 for regular movement.
**Important Clauses:**
- Clause A: In case of a medical emergency during these hours, passenger lift 1 can be locked on priority mode by security.
**FAQs:**
- *Q: Why is it done at night?* A: To cause minimal disruption to resident movement.
**Contact Information:** facility@zenithtowers.in | 022-9988-7766

***

**Document Type:** Parking Allocation Circular
**Society Name:** Cedar Crest Society
**Date:** 15 December 2026
**Content:**
**Author/Committee:** Managing Committee
**Overview:** Announcement regarding the lottery for unallocated stilt parking slots.
**Rules:**
1. 10 open stilt parking slots are available for allocation for the year 2027.
2. Interested residents must submit their applications to the office by Dec 20th.
3. The draw will take place in the clubhouse on Dec 24th at 11 AM.
**Important Clauses:**
- Clause 2: Only members without an existing covered parking space are eligible to apply.
- Clause 4: The lease fee is ₹1,500 per month, billed quarterly.
**FAQs:**
- *Q: Can a tenant apply for the lottery?* A: No, only registered flat owners can apply. Owners can then allow their tenants to use it.
**Contact Information:** parking@cedarcrest.co.in | +91-7654321098

***

**Document Type:** New Vendor Announcement
**Society Name:** Spring Gardens CHS
**Date:** 05 January 2027
**Content:**
**Author/Committee:** Estate Manager
**Overview:** Introduction of a new authorized vendor for high-speed fiber internet.
**Rules:**
1. JioFiber has been successfully wired throughout the society.
2. Jio agents will set up a kiosk in the central park this weekend for new connections.
3. No drilling in the main lobby walls is permitted; wires must use the existing electrical shafts.
**Important Clauses:**
- Clause 1: The society does not endorse any specific brand. Residents are free to choose between existing Airtel, Tata Play, or the new Jio service.
- Clause 3: Installation personnel must carry the society gate pass.
**FAQs:**
- *Q: Who will clear the old cables if I switch?* A: The new vendor is mandated to safely remove any dead cables of your previous connection.
**Contact Information:** manager@springgardens.in | Kiosk: 9 AM - 6 PM

***

**Document Type:** Committee Election Results
**Society Name:** Grandeur Park Residences
**Date:** 20 January 2027
**Content:**
**Author/Committee:** Election Returning Officer
**Overview:** Official declaration of the newly elected Managing Committee for the term 2027-2030.
**Rules:**
1. The new committee takes charge officially on Feb 1st, 2027.
2. Elected Members: Chairman - Mr. R. K. Singh (Flat 104); Secretary - Mrs. Anita Desai (Flat 502); Treasurer - Mr. V. Patel (Flat 908).
3. All pending applications for NOCs will be processed post-handover.
**Important Clauses:**
- Clause B: The election was conducted via secret ballot in accordance with the State Cooperative Societies Act.
- Clause E: A total of 180 valid votes were cast out of 200 eligible members.
**FAQs:**
- *Q: When is the first meeting of the new committee?* A: An open house will be held on Feb 5th at the clubhouse.
**Contact Information:** elections@grandeurpark.in | +91-9999111122

***

**Document Type:** Society Newsletter
**Society Name:** The Meadows Chronicle
**Date:** 01 February 2027
**Content:**
**Author/Committee:** Editorial Board, Green Meadows
**Overview:** Monthly roundup of events, achievements, and updates within the society.
**Rules/Highlights:**
1. **Green Award:** We won the "Best Composting Society" award from the Municipal Corporation!
2. **Sports Day:** Registrations open for the Annual Badminton Tournament. Register at the club desk by Feb 10th.
3. **Did You Know?** The society has planted 50 new saplings along the boundary wall. Please help water them.
**Important Clauses:**
- Clause N/A: (Community Update) We urge residents to contribute articles, recipes, or kids' artwork for next month's edition.
**FAQs:**
- *Q: How can I advertise my home baking business in the newsletter?* A: Residents get a free 2-line classified ad. Email the editorial team.
**Contact Information:** newsletter@greenmeadows.in | Editor: 022-2456-7890
"""

# Create custom styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=26,
    textColor=HexColor('#2c5282'),
    spaceAfter=10,
    alignment=TA_CENTER,
    fontName='Helvetica-Bold'
)

subtitle_style = ParagraphStyle(
    'CustomSubtitle',
    parent=styles['Normal'],
    fontSize=14,
    textColor=HexColor('#4a5568'),
    spaceAfter=50,
    alignment=TA_CENTER,
    fontName='Helvetica'
)

doc_header_style = ParagraphStyle(
    'DocHeader',
    parent=styles['Heading2'],
    fontSize=14,
    textColor=HexColor('#ffffff'),
    backColor=HexColor('#2c5282'),
    spaceAfter=10,
    spaceBefore=10,
    fontName='Helvetica-Bold',
    leftIndent=10,
    rightIndent=10
)

section_style = ParagraphStyle(
    'SectionTitle',
    parent=styles['Heading3'],
    fontSize=12,
    textColor=HexColor('#1a202c'),
    spaceAfter=6,
    spaceBefore=12,
    fontName='Helvetica-Bold',
    borderWidth=0,
    borderColor=HexColor('#edf2f7'),
    borderPadding=4
)

normal_style = ParagraphStyle(
    'CustomNormal',
    parent=styles['Normal'],
    fontSize=11,
    textColor=HexColor('#2d3748'),
    spaceAfter=8,
    fontName='Times-Roman'
)

contact_style = ParagraphStyle(
    'ContactStyle',
    parent=styles['Normal'],
    fontSize=10,
    textColor=HexColor('#4a5568'),
    alignment=TA_RIGHT,
    fontName='Times-Italic',
    spaceBefore=10
)

# Create PDF
pdf_filename = 'housing_society_documents.pdf'
doc = SimpleDocTemplate(
    pdf_filename,
    pagesize=A4,
    leftMargin=15*mm,
    rightMargin=15*mm,
    topMargin=18*mm,
    bottomMargin=18*mm
)

story = []

# Add title page
story.append(Paragraph("Housing Society Management Documents", title_style))
story.append(Paragraph("Training Data Collection (30 Mock Documents)", subtitle_style))
story.append(Spacer(1, 20))

docs = raw_text.strip().split('***')

for chunk in docs:
    chunk = chunk.strip()
    if not chunk:
        continue
    
    lines = chunk.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('**Document Type:**'):
            val = line.replace('**Document Type:**', '').strip()
            story.append(Spacer(1, 10))
            story.append(Paragraph(val, doc_header_style))
        
        elif line.startswith('**Society Name:**'):
            val = line.replace('**Society Name:**', '').strip()
            story.append(Paragraph(f"<b>Society Name:</b> {val}", normal_style))
        
        elif line.startswith('**Date:**'):
            val = line.replace('**Date:**', '').strip()
            story.append(Paragraph(f"<b>Date:</b> {val}", normal_style))
        
        elif line.startswith('**Author/Committee:**'):
            val = line.replace('**Author/Committee:**', '').strip()
            story.append(Paragraph(f"<b>Author/Committee:</b> {val}", normal_style))
            story.append(Spacer(1, 6))
        
        elif line.startswith('**Overview:**'):
            story.append(Paragraph("Overview", section_style))
            val = line.replace('**Overview:**', '').strip()
            if val:
                story.append(Paragraph(val, normal_style))
        
        elif line.startswith('**Rules:**') or line.startswith('**Rules/Resolutions:**') or line.startswith('**Rules/Highlights:**'):
            title = line.replace('**', '').strip().rstrip(':')
            story.append(Paragraph(title, section_style))
        
        elif line.startswith('**Important Clauses:**'):
            story.append(Paragraph("Important Clauses", section_style))
        
        elif line.startswith('**FAQs:**'):
            story.append(Paragraph("FAQs", section_style))
        
        elif line.startswith('**Contact Information:**'):
            val = line.replace('**Contact Information:**', '').strip()
            val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', val)
            story.append(Paragraph(f"Contact: {val}", contact_style))
        
        elif line.startswith('**Content:**'):
            pass
        
        elif re.match(r'^\d+\.', line):
            val = re.sub(r'^\d+\.', '', line).strip()
            val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', val)
            story.append(Paragraph(f"• {val}", normal_style))
        
        elif line.startswith('-'):
            val = line[1:].strip()
            val = re.sub(r'\*(.*?)\*', r'<i>\1</i>', val)
            val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', val)
            story.append(Paragraph(f"  - {val}", normal_style))
        
        else:
            val = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
            story.append(Paragraph(val, normal_style))
    
    story.append(Spacer(1, 15))

# Build PDF
doc.build(story)
print(f"PDF created successfully: {pdf_filename}")