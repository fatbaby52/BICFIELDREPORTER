import React, { useState, useRef, useEffect, useCallback } from "react";
import { Shield, Download, Check, ChevronLeft, Eye, Edit3, Users, Clock, Search, WifiOff, Plus, Save, Trash2, Filter } from "lucide-react";

// ─── DATA ───────────────────────────────────────────────────────────
// Exported for use in ClientPortal
export const SAFETY_TOPICS = [
  {
    id: 1,
    week: 1,
    category: "Excavation Safety",
    title: "Excavation Safety Overview",
    oshaRefs: ["29 CFR 1926.650", "29 CFR 1926.651", "29 CFR 1926.652"],
    overview: "Excavation work is one of the most hazardous construction operations. According to OSHA, cave-ins are the greatest risk and are far more likely to result in worker fatalities than other excavation-related accidents. Understanding the basic requirements of OSHA's excavation standard is the foundation of every safe dig.",
    keyPoints: ["All excavations 5 feet or deeper require a protective system (sloping, shoring, or shielding) unless the excavation is made entirely in stable rock.", "A competent person must inspect excavations daily before each shift, after every rainstorm, and after any event that could increase the hazard of a cave-in.", "Means of egress (ladders, steps, or ramps) must be provided in excavations 4 feet or deeper, spaced no more than 25 feet of lateral travel apart.", "Underground utilities must be located and marked before any digging begins. Contact your local One-Call system at least 48 hours in advance.", "Spoil piles, equipment, and materials must be kept at least 2 feet from the edge of excavations.", "Surface water and water accumulation in excavations must be controlled to prevent soil erosion and cave-ins."],
    discussionQuestions: ["What is the first thing a competent person should check before anyone enters an excavation?", "Can you name the three types of protective systems allowed by OSHA?", "What would you do if you noticed cracks forming along the edge of our excavation?"],
    remember: "No one enters an excavation until the competent person has inspected it AND a protective system is in place. No exceptions.",
  },
  {
    id: 2,
    week: 2,
    category: "Excavation Safety",
    title: "Soil Classification and Testing",
    oshaRefs: ["29 CFR 1926 Subpart P, Appendix A"],
    overview: "OSHA requires that soil and rock deposits be classified by a competent person before workers enter an excavation. Soil classification determines the type of protective system needed. Getting this wrong can be fatal — the wrong shoring in the wrong soil can fail without warning.",
    keyPoints: ["OSHA classifies soil into four categories: Stable Rock, Type A (most stable soil), Type B (medium stability), and Type C (least stable, including granular soils and submerged soil).", "Type A soil has an unconfined compressive strength of 1.5 tsf or greater. Examples include clay, silty clay, and sandy clay. However, no soil is Type A if it is fissured, subject to vibration, or has been previously disturbed.", "Type C soil has an unconfined compressive strength of 0.5 tsf or less. Gravel, sand, loamy sand, and submerged soil are always Type C. This is the most common classification on deep excavation jobs.", "At least one visual AND one manual test must be performed. Visual tests include checking for particle size, cracks, and water seepage. Manual tests include the thumb penetration test, pocket penetrometer, and ribbon test.", "Soil must be reclassified whenever conditions change — after rain, vibration from equipment, or when different soil layers are encountered.", "Layered soil systems must be classified according to the weakest layer."],
    discussionQuestions: ["What type of soil do we most commonly encounter on our job sites?", "If it rained overnight, can we assume the soil classification from yesterday still applies?", "Why would vibration from pile driving equipment affect soil classification?"],
    remember: "When in doubt, classify the soil as Type C and use the most protective system available. It is always safer to over-protect.",
  },
  {
    id: 3,
    week: 3,
    category: "Excavation Safety",
    title: "The Competent Person Role",
    oshaRefs: ["29 CFR 1926.650(b)", "29 CFR 1926.651(k)"],
    overview: "OSHA requires a designated competent person on every excavation project. This is not just a title — it is a critical safety role. The competent person must have the training, knowledge, and authority to identify hazards and immediately take corrective action, including stopping work.",
    keyPoints: ["A competent person is defined as someone capable of identifying existing and predictable hazards in surroundings or working conditions that are unsanitary, hazardous, or dangerous to employees, AND who has the authority to take prompt corrective action.", "The competent person must inspect the excavation, adjacent areas, and protective systems before each shift begins, after every rainstorm or water intrusion event, and as needed throughout the shift.", "They must perform soil classification using both visual and manual testing methods.", "The competent person has the authority to remove employees from the excavation immediately if a hazard is identified. No supervisor or foreman can override this authority on safety matters.", "They must ensure all spoil, equipment, and materials are kept back from the excavation edge, and that means of egress are properly placed.", "Documentation of inspections is critical. If OSHA investigates, the competent person's records are the first thing they review."],
    discussionQuestions: ["Who is the designated competent person on our current job site?", "If the competent person identifies a hazard, who can overrule their decision to stop work?", "What should you do if you notice a hazard but the competent person is not on site?"],
    remember: "The competent person is not just an inspector — they are the last line of defense against cave-ins. Their authority to stop work is absolute.",
  },
  {
    id: 4,
    week: 4,
    category: "Shoring Operations",
    title: "Shoring Systems: Types and Applications",
    oshaRefs: ["29 CFR 1926.652", "Subpart P Appendix C", "Subpart P Appendix D"],
    overview: "Shoring is a structural system that supports the sides of an excavation to prevent cave-ins. For deep excavation work, shoring is often the primary protective system. Understanding the different types of shoring and their proper applications is essential to keeping our crews safe.",
    keyPoints: ["Timber shoring uses wood components (wales, cross braces, and uprights) to support excavation walls. OSHA provides specific timber sizing tables in Appendix C based on soil type and excavation depth.", "Aluminum hydraulic shoring uses lightweight, adjustable hydraulic cylinders. It is faster to install and remove than timber but must be used strictly according to manufacturer tabulated data.", "Steel sheet piling (soldier piles and lagging, or continuous interlocking sheets) is used for deep excavations, especially in poor soil or near existing structures. Design must be approved by a registered professional engineer.", "All shoring systems must be installed from the top down and removed from the bottom up to maintain continuous protection.", "Shoring must be designed to resist all loads that could reasonably be applied, including surcharge loads from spoil piles, equipment, and adjacent structures.", "Never modify or alter manufactured shoring components. If a system doesn't fit, contact the manufacturer or engineer."],
    discussionQuestions: ["What type of shoring system are we currently using on our project, and why was it selected?", "Why is it important to install shoring from the top down?", "What should you do if a hydraulic shore is leaking or not holding pressure?"],
    remember: "A shoring system is only as good as its installation. Follow the engineer's design and manufacturer's instructions exactly — field modifications can cause catastrophic failure.",
  },
  {
    id: 5,
    week: 5,
    category: "Pile Driving Safety",
    title: "Pile Driving Equipment Safety",
    oshaRefs: ["29 CFR 1926.603"],
    overview: "Pile driving involves operating heavy equipment that generates extreme forces, noise, and vibration. The hazards are significant: falling objects from leads, struck-by injuries from swinging hammers, and equipment failures. Every crew member near pile driving operations must understand the safety requirements.",
    keyPoints: ["Boiler and piping systems on pile driving equipment must meet the applicable ASME standards. Steam lines must be securely fastened and protected from damage.", "All employees must be kept clear of the hammer drop zone. A blocking device capable of supporting the hammer's full weight must be in place whenever anyone works under the hammer.", "Overhead protection for the operator must be equivalent to 2-inch planking or solid material of equivalent strength.", "Fixed leads must have a ladder and adequate attachment points for safety belt lanyards so loft workers can tie off at all times.", "Guards must be in place across the top of the head block to prevent the cable from jumping out of the sheaves.", "When the pile driving hammer is not in use, it must be blocked or secured in the leads to prevent accidental release."],
    discussionQuestions: ["What is the minimum safe distance our crew should maintain from active pile driving?", "How do you verify the blocking device is properly rated for the hammer weight?", "What are the hand signals used on our site for pile driving operations?"],
    remember: "Never position yourself under a suspended pile driving hammer, and never assume the blocking device is in place — verify it yourself every time.",
  },
  {
    id: 6,
    week: 6,
    category: "Fall Protection",
    title: "Fall Protection at Excavation Edges",
    oshaRefs: ["29 CFR 1926.501", "29 CFR 1926.502"],
    overview: "Falls into excavations are a leading cause of injury on our type of work. Guardrails, barriers, and personal fall protection may all be required depending on the depth and layout of the excavation. Everyone working near an open excavation must understand the fall hazards and protections in place.",
    keyPoints: ["Guardrail systems, fences, or barricades must be provided where employees or equipment may fall into excavations that are not readily visible due to plant growth, darkness, or other obstructions.", "Walkways with standard guardrails (42-inch top rail, 21-inch mid rail, 4-inch toeboard) must be provided where employees are required to cross over excavations.", "Where employees work at the edge of excavations 6 feet or more deep, fall protection (guardrails, safety nets, or personal fall arrest systems) is required under Subpart M.", "Warning signs and high-visibility barricade tape alone are NOT adequate fall protection for excavation edges where workers are actively performing tasks.", "Equipment operators near excavation edges must have the vehicle's cab or ROPS positioned to protect against roll-over into the excavation.", "Adequate lighting must be provided during night operations to ensure excavation edges are clearly visible."],
    discussionQuestions: ["Are there any areas on our current site where someone could accidentally walk into an open excavation?", "What type of fall protection do we have in place at the excavation edge right now?", "How should we handle fall protection when working near an excavation at night?"],
    remember: "An open excavation is an open hole. If a person can fall into it, it must be protected — no matter how 'obvious' it seems.",
  },
  {
    id: 7,
    week: 7,
    category: "Excavation Safety",
    title: "Underground Utility Locating",
    oshaRefs: ["29 CFR 1926.651(b)"],
    overview: "Striking an underground utility during excavation can cause electrocution, explosion, flooding, or environmental contamination. OSHA requires that the estimated locations of all underground installations be determined before opening an excavation. This is non-negotiable and must happen before the first bucket of dirt is moved.",
    keyPoints: ["Contact your state One-Call notification center (811) at least 48–72 hours before excavation begins. This is required by law in all 50 states.", "The utility locate markings use a standard color code: Red = Electric, Yellow = Gas/Oil, Orange = Communications, Blue = Water, Green = Sewer, White = Proposed excavation, Pink = Survey marks.", "Utility locators mark approximate locations. When excavating within the tolerance zone (typically 18–24 inches on either side of marks), hand digging or vacuum excavation (potholing) is required.", "If an unmarked utility is discovered during excavation, STOP WORK immediately. Do not attempt to identify it, move it, or work around it until the utility owner has been contacted.", "Overhead power lines are also a hazard during excavation. Equipment must maintain minimum clearance distances (typically 10 feet for lines under 50kV).", "Document all utility locates with photos and keep records on site. Locate marks can fade or be disturbed by equipment — re-mark as needed."],
    discussionQuestions: ["When was the last time utility locates were refreshed on our current job site?", "What would you do if you hit something unexpected while excavating?", "Who on our crew is responsible for calling 811 and coordinating utility locates?"],
    remember: "Assume every excavation has underground utilities until proven otherwise. One bucket of dirt in the wrong place can kill.",
  },
  {
    id: 8,
    week: 8,
    category: "Heavy Equipment",
    title: "Crane and Rigging Safety for Pile Work",
    oshaRefs: ["29 CFR 1926.1400-1442", "29 CFR 1926.251"],
    overview: "Cranes are used extensively in piling and shoring operations for lifting sheet piles, H-beams, shoring components, and pile driving equipment. Rigging failures and crane incidents are among the most catastrophic events on construction sites. Every lift must be planned, inspected, and executed properly.",
    keyPoints: ["A qualified rigger must rig all loads. A qualified rigger is someone who can demonstrate they possess sufficient knowledge, training, and experience to properly rig loads.", "Never exceed the crane's rated capacity. The operator must have the load chart available and must account for the weight of all rigging hardware, the radius of lift, and boom length.", "All rigging components (slings, shackles, hooks) must be inspected before each shift. Remove from service any component showing damage, deformation, or wear beyond manufacturer limits.", "Tag lines must be used to control loads and prevent them from swinging. Never use your hands to guide a suspended load into position.", "The crane's swing radius must be barricaded to prevent workers from being struck by the counterweight or superstructure.", "Cranes must be set up on firm, level ground and outriggers (if equipped) must be fully extended on adequate cribbing pads."],
    discussionQuestions: ["Who is the designated qualified rigger on our crew?", "What is the maximum capacity of the crane we are currently using, and how does boom angle affect it?", "What should you do if you see a rigging component that looks damaged?"],
    remember: "Every lift is a critical lift when people are in the area. Plan it, rig it right, and never walk under a suspended load.",
  },
  {
    id: 9,
    week: 9,
    category: "Electrical Safety",
    title: "Electrical Hazards in Excavations",
    oshaRefs: ["29 CFR 1926.405", "29 CFR 1926.416"],
    overview: "Excavation and shoring crews face unique electrical hazards: underground power lines, temporary power cords in wet conditions, and equipment operating near overhead lines. Water and electricity are a deadly combination, and our work environments frequently involve both.",
    keyPoints: ["All temporary electrical equipment used in or near excavations must be protected by ground-fault circuit interrupters (GFCIs). This includes pumps, lighting, power tools, and welding equipment.", "Extension cords and power cables must be kept out of standing water. If water accumulates in the excavation, de-energize all electrical equipment before addressing the water.", "Damaged extension cords and cables must be taken out of service immediately. Electrical tape repairs are not acceptable — replace the cord.", "When working near overhead power lines, maintain minimum approach distances: 10 feet for lines up to 50kV, plus 4 inches for every additional 10kV above 50kV.", "If underground electrical lines are exposed during excavation, they must be protected, supported, and clearly marked. Do not assume they are de-energized.", "Portable generators used at the excavation site must be properly grounded and positioned outside the excavation."],
    discussionQuestions: ["Where are the GFCIs located for our electrical equipment at the current site?", "What would you do if you accidentally cut into an underground electrical conduit?", "How do we ensure our dewatering pumps are safely powered?"],
    remember: "Water in an excavation plus electricity equals a potential fatality. Assume all exposed or damaged electrical lines are live until verified otherwise.",
  },
  {
    id: 10,
    week: 10,
    category: "Shoring Operations",
    title: "Steel Sheet Pile Installation Safety",
    oshaRefs: ["29 CFR 1926.652", "29 CFR 1926.603", "29 CFR 1926.251"],
    overview: "Steel sheet piles are commonly used to provide earth retention for deep excavations, cofferdams, and waterfront structures. The installation process involves handling heavy steel sections with cranes and driving them with vibratory or impact hammers. The hazards include struck-by injuries, pinch points, noise exposure, and equipment failures.",
    keyPoints: ["Sheet piles must be handled and stored safely. Stack piles on level ground with blocking to prevent rolling or sliding. Never stack higher than the manufacturer recommends.", "When threading sheet piles into interlocks, keep hands and fingers clear of the interlock joint. Pinch-point injuries are extremely common during this operation. Use guide equipment, not hands, to align piles.", "During vibratory driving, the vibration energy is transmitted through the ground and can affect adjacent structures, underground utilities, and soil stability. Monitor for settlement and vibration impacts.", "Workers must never ride or stand on sheet piles while they are being driven. Maintain a clear zone around the pile being driven.", "Hearing protection is mandatory during pile driving. Impact hammers can generate noise levels exceeding 120 dB, causing immediate hearing damage.", "Welding and cutting of sheet piles on site requires a hot work permit, fire watch, and proper ventilation (especially for coated piles that can release toxic fumes)."],
    discussionQuestions: ["What personal protective equipment is required when working near sheet pile installation?", "How do we monitor vibration impacts on adjacent structures during driving?", "What is the procedure if a sheet pile refuses to drive to the required depth?"],
    remember: "Sheet piles are heavy, sharp-edged, and unpredictable during driving. Stay clear of the driving zone and always wear hearing and hand protection.",
  },
  {
    id: 11,
    week: 11,
    category: "General Safety",
    title: "Personal Protective Equipment (PPE)",
    oshaRefs: ["29 CFR 1926.95", "29 CFR 1926.100", "29 CFR 1926.102"],
    overview: "Personal protective equipment is your last line of defense against workplace hazards. On shoring, piling, and excavation projects, proper PPE is especially critical because of the variety of hazards present: falling objects, noise, struck-by hazards, and exposure to soil and water.",
    keyPoints: ["Hard hats are mandatory at all times on the job site. They must meet ANSI Z89.1 standards. Inspect daily for cracks, dents, or UV degradation. Replace after any impact.", "Safety glasses with side shields are the minimum eye protection. When cutting, grinding, or welding, upgrade to goggles or a face shield as appropriate.", "Hearing protection is required when noise levels exceed 85 dB over an 8-hour time-weighted average. On piling projects, noise near the hammer often exceeds 100 dB — double hearing protection (plugs AND muffs) is recommended.", "Steel-toed boots (ASTM F2413 rated) with puncture-resistant soles are required. Rubber boots may be needed when working in water or wet excavations.", "High-visibility vests or clothing (ANSI Class 2 minimum) are required whenever mobile equipment is operating in the work area.", "Gloves appropriate to the task must be worn. Impact-resistant gloves are recommended for sheet pile handling. Chemical-resistant gloves for contact with treated or contaminated soils."],
    discussionQuestions: ["When was the last time you inspected your hard hat for damage or age?", "Are there any tasks we perform where our current PPE might not be adequate?", "What type of gloves should be used when handling sheet piles versus when working with treated timbers?"],
    remember: "PPE only works if you wear it correctly, every time. A hard hat in the truck does not protect your head.",
  },
  {
    id: 12,
    week: 12,
    category: "Excavation Safety",
    title: "Water Accumulation and Dewatering",
    oshaRefs: ["29 CFR 1926.651(h)"],
    overview: "Water is one of the most dangerous factors in excavation work. It weakens soil, increases lateral pressure on shoring systems, reduces visibility of hazards, and creates drowning risks. Controlling water in and around excavations is critical to the safety of everyone on site.",
    keyPoints: ["No employee may work in an excavation where water is accumulating unless adequate precautions are taken. This includes the use of shoring or shielding designed for the water conditions and continuous dewatering.", "Diversion ditches, dikes, or other means must be used to prevent surface water from entering the excavation.", "A competent person must monitor water removal operations and must inspect for evidence of cave-in, failure of protective systems, or hazardous atmospheres caused by water accumulation.", "Dewatering pumps must be properly sized for the volume of water expected. Always have backup pumps available on site in case of primary pump failure.", "If the excavation is in an area with a high water table, a dewatering plan must be developed before excavation begins. This may require wellpoint systems, deep wells, or sump pumps.", "Standing water in an excavation can conceal hazards such as drop-offs, debris, exposed utilities, and uneven footing. Never enter standing water without understanding the conditions below the surface."],
    discussionQuestions: ["What is our dewatering plan for the current excavation?", "How do we handle discharge water from our pumps in compliance with local environmental regulations?", "What would we do if both our primary and backup dewatering pumps failed?"],
    remember: "Water in an excavation is never just water — it is actively weakening the soil that your shoring is holding back. Address it immediately.",
  },
  {
    id: 13,
    week: 13,
    category: "General Safety",
    title: "Hazard Communication (HazCom)",
    oshaRefs: ["29 CFR 1926.59", "29 CFR 1910.1200"],
    overview: "Excavation and piling crews can encounter a variety of chemical hazards: contaminated soils, diesel fuel and hydraulic fluid, concrete additives, welding fumes, and coatings on steel piles. OSHA's Hazard Communication Standard ensures that workers know what chemical hazards they face and how to protect themselves.",
    keyPoints: ["A written Hazard Communication Program must be maintained on site. It must include a list of all hazardous chemicals present, Safety Data Sheets (SDS) for each chemical, and a labeling system.", "Safety Data Sheets must be readily accessible to all employees during their shift. Know where the SDS binder or digital access point is located on your site.", "All chemical containers must be labeled with the product name, hazard warnings, and manufacturer information. Never use unlabeled containers.", "If contaminated soil is encountered during excavation (unusual colors, odors, or known contamination), stop work and notify the competent person immediately. Air monitoring may be required.", "Hydraulic fluid leaks from equipment can contaminate soil and water. Report leaks immediately and use spill containment materials.", "Workers handling treated timber (such as CCA-treated wood used in some shoring) must wear gloves and avoid burning the material, which releases toxic arsenic compounds."],
    discussionQuestions: ["Where is the SDS information located on our job site?", "What chemicals do we regularly use or encounter on our projects?", "What should you do if you notice an unusual odor or discoloration in the soil during excavation?"],
    remember: "If you do not know what a substance is, do not touch it, breathe it, or ignore it. Stop work and find out.",
  },
  {
    id: 14,
    week: 14,
    category: "Shoring Operations",
    title: "Timber Shoring: Design and Installation",
    oshaRefs: ["29 CFR 1926.652", "Subpart P Appendix C"],
    overview: "Timber shoring remains a widely used protective system for excavations. OSHA provides specific timber sizing tables in Appendix C of the excavation standard. Proper timber selection, installation sequence, and ongoing inspection are critical to preventing shoring failures.",
    keyPoints: ["Timber used for shoring must be construction grade or better, free of large or loose knots, and free of damage that would compromise its structural integrity.", "OSHA's Appendix C provides tables for timber shoring dimensions based on soil type, excavation depth, and horizontal spacing of cross braces. These tables are the minimum — a registered PE may design more robust systems.", "Install shoring from the top down as the excavation progresses. Never excavate below the lowest installed shore without extending the shoring system first.", "Remove shoring from the bottom up during backfill operations. Remove cross braces and wales only as backfill reaches a level that provides equivalent support.", "Inspect all timber components before installation. Check for splits, cracks, rot, insect damage, or excessive warping. Never reuse compromised timber.", "Wedges must be securely placed and checked regularly. Vibration from equipment and pile driving can loosen wedges over time."],
    discussionQuestions: ["How do we verify that the timber we receive on site meets construction grade requirements?", "What happens if we need to go deeper than the depth shown on OSHA's timber shoring tables?", "How frequently should we re-check wedge tightness on an active shoring installation?"],
    remember: "Timber shoring works only when every component is the right size, properly placed, and in good condition. One weak member can compromise the entire system.",
  },
  {
    id: 15,
    week: 15,
    category: "Pile Driving Safety",
    title: "Vibratory Hammer Operations",
    oshaRefs: ["29 CFR 1926.603", "29 CFR 1926.52"],
    overview: "Vibratory hammers are commonly used for driving and extracting sheet piles and H-piles. While they operate differently than impact hammers, they present their own unique hazards including extreme noise, ground vibration that can destabilize adjacent soil and structures, and mechanical failure risks.",
    keyPoints: ["Vibratory hammers must be securely connected to the pile before energizing. Verify all clamp bolts are tight and the hydraulic clamp is fully engaged before starting vibration.", "When a vibratory hammer is operating, the entire pile vibrates intensely. Workers must stay well clear of the pile and any connected shoring or structure that could transmit vibration energy.", "Ground vibrations from vibratory driving can cause settlement, damage to adjacent structures, and destabilization of nearby excavation walls. Pre-construction surveys and vibration monitoring should be conducted.", "Noise levels during vibratory driving can exceed 100 dB. Hearing protection is mandatory for all workers in the area, not just the equipment operator.", "Hydraulic hoses on vibratory hammers operate under extreme pressure. Inspect hoses for wear, abrasion, and leaks before each use. A hydraulic hose failure can cause severe injection injuries or burns.", "Never attempt to free a stuck pile by exceeding the equipment's rated capacity. Consult the operator's manual and project engineer for proper procedures."],
    discussionQuestions: ["What vibration monitoring equipment do we have on site, and who is responsible for reading it?", "What is the procedure if a neighbor reports vibration damage to their property?", "What pre-shift inspection items are specific to our vibratory hammer?"],
    remember: "Vibratory hammers generate forces you can feel in your teeth. If you can feel it, it is affecting the ground and structures around you. Monitor constantly.",
  },
  {
    id: 16,
    week: 16,
    category: "Fall Protection",
    title: "Ladder Safety in Excavations",
    oshaRefs: ["29 CFR 1926.1053", "29 CFR 1926.651(c)(2)"],
    overview: "Ladders are the primary means of getting in and out of excavations. A poorly placed, damaged, or misused ladder can turn a routine entry into a fall injury. OSHA requires that ladders be provided within 25 feet of lateral travel for all workers in excavations 4 feet or deeper.",
    keyPoints: ["Ladders must extend at least 3 feet above the top of the excavation or landing. This provides a handhold for safe mounting and dismounting.", "The ladder must be placed at the correct angle: the base should be 1 foot out from the wall for every 4 feet of height (4:1 rule).", "Ladders must be secured at the top to prevent displacement. In excavations, they should also be secured at the bottom to prevent kickout on loose or wet soil.", "Metal ladders must never be used near electrical hazards. Use fiberglass ladders when working near overhead or underground power lines.", "Inspect ladders before each use. Check for bent or missing rungs, cracked rails, and damaged feet. Remove damaged ladders from service immediately.", "Only one person on a ladder at a time unless the ladder is designed for multiple user loading. Maintain three points of contact at all times while climbing."],
    discussionQuestions: ["Are our ladders positioned within 25 feet of every work location in the current excavation?", "When was the last time you inspected the ladder you use to enter the excavation?", "What would you do in an emergency evacuation if the nearest ladder is more than 25 feet away?"],
    remember: "A ladder is your lifeline out of an excavation. If it is missing, damaged, or improperly placed, you are trapped in a hazardous space.",
  },
  {
    id: 17,
    week: 17,
    category: "Excavation Safety",
    title: "Protective Systems: Sloping and Benching",
    oshaRefs: ["29 CFR 1926.652(b)", "Subpart P Appendix B"],
    overview: "Sloping and benching are protective systems that cut the excavation walls at angles to prevent cave-ins. While our work often requires vertical walls with shoring, there are situations where sloping or benching may be used alone or in combination with shoring. Understanding these systems helps everyone recognize safe and unsafe excavation profiles.",
    keyPoints: ["Sloping removes soil at an angle from the edge of the excavation. The maximum allowable slope depends on soil type: Type A = 3/4H:1V (53 degrees), Type B = 1H:1V (45 degrees), Type C = 1.5H:1V (34 degrees).", "Benching creates a series of horizontal steps in the excavation wall. Benching is NOT allowed in Type C soil because this soil type cannot hold a vertical face at any height.", "OSHA's Appendix B provides configurations for sloping and benching based on soil type. The competent person must select the appropriate configuration.", "Combination systems (sloping the upper portion and shoring the lower portion) may be used where site conditions require it, but must be designed by a registered professional engineer if not covered by Appendix B tables.", "Surcharge loads (equipment, spoil piles, materials, traffic) add weight to the excavation walls and may require flatter slopes than the minimums shown in Appendix B.", "Rain, vibration, and changes in soil moisture can alter slope stability. The competent person must re-evaluate slope adequacy after any change in conditions."],
    discussionQuestions: ["Can you estimate the slope ratio of our current excavation walls? Does it match the soil classification?", "Why is benching not allowed in Type C soil?", "What effect does running heavy equipment near the edge of a sloped excavation have on stability?"],
    remember: "A slope that was safe yesterday may not be safe today. Weather, vibration, and time all work against slope stability.",
  },
  {
    id: 18,
    week: 18,
    category: "General Safety",
    title: "Heat Illness Prevention",
    oshaRefs: ["General Duty Clause Section 5(a)(1)", "OSHA Heat Campaign"],
    overview: "Excavation and piling work is physically demanding and often performed in direct sun with little shade. Workers in and around excavations face additional heat stress because excavations can trap heat and restrict airflow. Heat illness can progress from cramps to heat exhaustion to heat stroke rapidly — and heat stroke can be fatal.",
    keyPoints: ["Know the symptoms: Heat cramps (muscle spasms), heat exhaustion (heavy sweating, weakness, nausea, dizziness, cool/pale skin), and heat stroke (hot/red/dry skin, confusion, loss of consciousness). Heat stroke is a medical emergency — call 911 immediately.", "Follow the Water-Rest-Shade approach: Drink water every 15 minutes even if not thirsty, take regular rest breaks in shaded or cool areas, and acclimatize new or returning workers gradually over 1–2 weeks.", "Workers in excavations have reduced airflow and may be exposed to reflected heat from shoring and equipment. Monitor these workers closely for signs of heat stress.", "New workers and those returning from absence are most at risk. OSHA data shows that most heat-related fatalities occur during the first few days on a job.", "Designate a buddy system during hot weather so workers can monitor each other for early signs of heat illness.", "Never use alcohol, caffeine, or energy drinks as substitutes for water during hot weather work."],
    discussionQuestions: ["What is our plan if someone shows signs of heat stroke in the bottom of an excavation?", "Where are the nearest shade areas and water stations on our current site?", "How do we handle acclimatization for new crew members who start during the summer?"],
    remember: "Heat kills more construction workers than any other weather-related hazard. Water, rest, and shade are not luxuries — they are safety requirements.",
  },
  {
    id: 19,
    week: 19,
    category: "Shoring Operations",
    title: "Hydraulic Shoring: Inspection and Maintenance",
    oshaRefs: ["29 CFR 1926.652(c)", "Subpart P Appendix D"],
    overview: "Aluminum hydraulic shoring is widely used because it is lightweight, adjustable, and fast to install. However, these systems operate under tremendous pressure and their safety depends entirely on proper inspection, correct placement per manufacturer specifications, and routine maintenance.",
    keyPoints: ["Hydraulic shoring must be used strictly in accordance with the manufacturer's tabulated data. This data specifies maximum depth, cylinder spacing, soil type ratings, and installation procedures.", "Before each use, inspect cylinders for leaks, dents, or bent rods. Check that all pins, clips, and retaining devices are in place and functional.", "Hydraulic pressure must be maintained at the manufacturer's recommended level. Check gauges regularly throughout the shift. A slow pressure loss may indicate a failing seal.", "Rails and spreaders must be straight, undamaged, and free of corrosion that could weaken the structural capacity. Do not use components from different manufacturers interchangeably.", "Installation sequence matters: follow the manufacturer's instructions for the order in which shores are placed, pressurized, and connected to waler systems.", "Keep detailed maintenance records for all hydraulic shoring components. Cylinders should be serviced and re-certified on the manufacturer's recommended schedule."],
    discussionQuestions: ["Who is responsible for checking hydraulic pressures on our shoring system during the shift?", "What is the procedure if a hydraulic cylinder is found leaking during use?", "Where can we find the manufacturer's tabulated data for the shoring system we are currently using?"],
    remember: "A hydraulic shore losing pressure is losing its ability to hold back the earth. Treat any pressure drop as an immediate hazard.",
  },
  {
    id: 20,
    week: 20,
    category: "Pile Driving Safety",
    title: "Working Near and Around Pile Driving Operations",
    oshaRefs: ["29 CFR 1926.603", "29 CFR 1926.600"],
    overview: "Not everyone on a job site operates the pile driving equipment, but many workers perform tasks in the vicinity of active driving operations. These workers face hazards from ground vibration, noise, flying debris, and swinging equipment. Understanding how to work safely in the zone of influence is essential.",
    keyPoints: ["Establish and communicate a clear exclusion zone around active pile driving operations. Only essential personnel should be within this zone during driving.", "Workers outside the exclusion zone but within the zone of influence must still wear hearing protection. Sound travels, and sustained exposure above 85 dB causes permanent hearing loss.", "Ground vibration from pile driving can cause unexpected settlement, cracking, or movement of adjacent soil, shoring, and structures. Workers near excavation edges should be alert for signs of instability.", "When piles are being hoisted and positioned, treat the area as a crane lift zone. Stay out from under suspended loads and watch for swing hazards.", "Communication is critical during pile driving because noise makes verbal communication difficult. Establish clear hand signals and visual communication methods before operations begin.", "Equipment backing and repositioning during pile driving operations is a major struck-by hazard. Spotters must be used when any equipment moves on site."],
    discussionQuestions: ["Where is the exclusion zone boundary on our current site, and is it clearly marked?", "How do we communicate with the crane operator during pile driving when verbal communication is impossible?", "Have you noticed any signs of ground settlement or shoring movement near our pile driving area?"],
    remember: "If you can feel vibration in the ground, you are within the zone of influence. Stay alert and watch for changes in the soil and structures around you.",
  },
  {
    id: 21,
    week: 21,
    category: "Electrical Safety",
    title: "Lockout/Tagout (LOTO) Procedures",
    oshaRefs: ["29 CFR 1910.147", "29 CFR 1926.417"],
    overview: "Lockout/Tagout protects workers from the unexpected startup of equipment or the release of stored energy during maintenance and repair. On our projects, this applies to pumps, generators, compressors, vibratory hammers, and any equipment that must be serviced or adjusted.",
    keyPoints: ["Lockout/Tagout must be performed before any employee works on equipment where unexpected energization could cause injury. This includes mechanical, electrical, hydraulic, and pneumatic energy sources.", "Only trained and authorized employees may perform LOTO procedures. Each authorized employee places their own lock and tag — never allow someone else to lock out on your behalf.", "The six steps of LOTO: (1) Notify affected employees, (2) Shut down equipment using normal procedures, (3) Isolate all energy sources, (4) Apply lockout devices and tags, (5) Release or restrain all stored energy, (6) Verify isolation by attempting to start the equipment.", "Stored energy must be addressed: hydraulic and pneumatic systems must be bled down, springs must be released or blocked, elevated components must be lowered or blocked.", "Tags alone are NOT a substitute for locks. If a lockout device cannot be applied, a tagout system may be used only with additional safety measures approved by a qualified person.", "Remove your lock and tag only when you have personally verified that all workers are clear and the equipment is ready for normal operation."],
    discussionQuestions: ["What equipment on our current site requires LOTO before maintenance?", "Where are the LOTO kits and devices located on our site?", "What stored energy sources exist in our hydraulic shoring system that would need to be addressed during maintenance?"],
    remember: "The lock on that switch represents a human life. Never remove someone else's lock, and never skip LOTO because the job will 'only take a minute.'",
  },
  {
    id: 22,
    week: 22,
    category: "Excavation Safety",
    title: "Hazardous Atmospheres in Excavations",
    oshaRefs: ["29 CFR 1926.651(g)"],
    overview: "Excavations deeper than 4 feet can contain hazardous atmospheres, particularly in areas with contaminated soil, near landfills, utility lines, or in urban environments. Toxic gases, oxygen deficiency, and flammable vapors are invisible hazards that have killed workers who had no idea the air they were breathing was dangerous.",
    keyPoints: ["When a hazardous atmosphere exists or could reasonably be expected, atmospheric testing must be performed before workers enter the excavation. Test for oxygen levels, flammable gases, and toxic gases.", "Normal oxygen levels are 20.9%. OSHA considers atmospheres below 19.5% oxygen-deficient and above 23.5% oxygen-enriched — both are hazardous.", "Excavations near gas lines, landfills, fuel storage, industrial facilities, or contaminated ground are high-risk for hazardous atmospheres. Test before entry and monitor continuously.", "If a hazardous atmosphere is detected, ventilate the excavation with mechanical blowers before allowing entry. Continuously monitor while workers are present.", "Emergency rescue equipment must be available when workers enter excavations with potential hazardous atmospheres. This includes supplied-air respirators and retrieval systems.", "Gasoline-powered equipment (generators, pumps, compressors) must never be operated inside or at the edge of an excavation where exhaust can accumulate — carbon monoxide is odorless and lethal."],
    discussionQuestions: ["Do we have atmospheric monitoring equipment on site, and is it currently calibrated?", "Are there any known contamination issues in the area where we are excavating?", "Where should gasoline-powered generators and pumps be positioned relative to our excavation?"],
    remember: "You cannot see, smell, or taste many toxic gases. Never assume the air in an excavation is safe — test it, then keep testing it.",
  },
  {
    id: 23,
    week: 23,
    category: "Heavy Equipment",
    title: "Excavator Safety and Swing Radius",
    oshaRefs: ["29 CFR 1926.600", "29 CFR 1926.601"],
    overview: "Excavators are essential tools on every job we work. They are also one of the most common sources of struck-by and caught-between fatalities on construction sites. The swing radius of the superstructure, the blind spots, and the ground pressure all create hazards that every crew member must understand.",
    keyPoints: ["Never approach an operating excavator without making eye contact with the operator and receiving a clear signal that it is safe. Assume the operator cannot see you.", "The swing radius of the superstructure and counterweight creates a deadly crush zone. Barricade the swing area when workers are nearby. Do not stand between the excavator and a wall, pile, or other fixed object.", "Operators must ensure the excavator is on stable ground that can support the machine's weight. Operating too close to an excavation edge can cause a cave-in or the machine can fall into the excavation.", "Seat belts must be worn at all times during operation. If the machine goes over, the ROPS protects the operator only if they stay inside the cab.", "When loading trucks, never swing the bucket over workers. Clear the area first, then load. Workers should never be between the excavator and the truck during loading.", "Before leaving the excavator, lower all implements to the ground, set the swing brake, engage the parking brake, and shut off the engine. Never leave a running machine unattended."],
    discussionQuestions: ["What hand signals do we use to communicate with our excavator operator?", "How close to our excavation edge is it safe to position the excavator?", "Have there been any near-miss incidents with equipment swing radius on our site?"],
    remember: "An excavator operator has massive blind spots. If you cannot see the operator's eyes, the operator cannot see you. Stay out of the swing radius.",
  },
  {
    id: 24,
    week: 24,
    category: "General Safety",
    title: "Emergency Action Plan",
    oshaRefs: ["29 CFR 1926.35"],
    overview: "When an emergency happens in or around an excavation, the response must be immediate and organized. Cave-ins, equipment failures, utility strikes, and medical emergencies require plans that every worker knows before the emergency occurs. Confusion during an emergency costs lives.",
    keyPoints: ["Every job site must have a written Emergency Action Plan that covers: evacuation routes and procedures, emergency contact numbers, rally points, and rescue procedures specific to excavation work.", "All workers must know: the location of the nearest phone or radio, the site address (for directing emergency services), the location of fire extinguishers, first aid kits, and AED devices.", "In a cave-in emergency, do NOT enter the excavation to rescue a buried worker. This is the number one cause of multiple-fatality cave-in incidents. Call 911 and wait for trained rescue personnel.", "Establish a clear chain of command for emergencies. Every worker should know who to report to and who makes the call to emergency services.", "Practice emergency evacuations periodically. Workers in deep excavations must be able to reach a ladder or ramp quickly. Time your evacuation drills.", "If a utility is struck (gas, electric, water), immediately evacuate the area, move upwind if gas is suspected, and do not attempt to repair the utility yourself."],
    discussionQuestions: ["What is the street address of our current job site? Can you give directions to an ambulance driver?", "What is our rescue plan if a worker is trapped at the bottom of our deepest excavation?", "Where is the rally point, and does everyone on the crew know where it is?"],
    remember: "An emergency plan that nobody knows about is not a plan — it is a piece of paper. Every person on site must know the plan before the emergency happens.",
  },
  {
    id: 25,
    week: 25,
    category: "Shoring Operations",
    title: "Soldier Pile and Lagging Systems",
    oshaRefs: ["29 CFR 1926.652(c)", "29 CFR 1926.651"],
    overview: "Soldier pile and lagging is a common earth retention system for deep excavations, especially in urban environments where space for sloping is not available. H-piles (soldier piles) are driven or drilled into the ground at regular intervals, and timber or concrete lagging is placed between them as the excavation deepens. This system requires careful engineering, precise installation, and continuous monitoring.",
    keyPoints: ["Soldier pile and lagging systems must be designed by a registered professional engineer. The design specifies pile size, spacing, embedment depth, lagging thickness, and waler/bracing requirements.", "As the excavation deepens, lagging must be installed promptly. Never allow the open face between soldier piles to exceed the designed unsupported height. Soil can fail rapidly once exposed.", "Lagging must be tightly placed against the soil face. Gaps behind lagging allow soil to run through, creating voids that can lead to surface settlement or sudden collapse.", "Monitor soldier piles for lateral movement using survey instruments or inclinometers. Any unexpected movement must be reported to the engineer immediately.", "When internal bracing or tiebacks are required, they must be installed before excavation proceeds below the design level. Never excavate ahead of the bracing installation.", "Dewatering around soldier piles is critical. Water pressure behind the lagging significantly increases loads on the system beyond what may have been designed for."],
    discussionQuestions: ["How do we monitor our soldier piles for lateral movement on the current project?", "What is the maximum height of unsupported face allowed between our soldier piles?", "What would you do if you noticed a gap developing behind the lagging with soil running through?"],
    remember: "A soldier pile system is only as strong as the lagging between the piles. Keep lagging tight, keep water out, and never excavate ahead of the bracing.",
  },
  {
    id: 26,
    week: 26,
    category: "General Safety",
    title: "Housekeeping and Site Organization",
    oshaRefs: ["29 CFR 1926.25", "29 CFR 1926.251"],
    overview: "Good housekeeping on a construction site is not about appearances — it is about safety. Cluttered work areas, improperly stored materials, and poor site organization create tripping hazards, block emergency exits, and make it harder to identify real hazards. On excavation and piling projects where space is tight, housekeeping is especially critical.",
    keyPoints: ["Keep the area around excavation edges clear of debris, tools, and materials. Objects near the edge can fall into the excavation and strike workers below, or workers can trip and fall in.", "Spoil piles must be kept at least 2 feet from the edge of excavations. This is an OSHA requirement, not a suggestion.", "Organize material laydown areas so that shoring components, piles, and equipment parts are accessible without creating hazards. Never stack materials in a way that blocks access to ladders, fire extinguishers, or emergency equipment.", "Scrap materials, cut-off pieces, and waste must be removed from the work area regularly. Sharp metal scraps from sheet pile cutting are a serious laceration and puncture hazard.", "Hoses, cables, and power cords must be routed to avoid tripping hazards, especially near excavation edges and access points. Use cord covers or elevate cords on stands.", "At the end of each shift, secure the site. Cover or barricade open excavations, secure equipment, and ensure warning signs and lighting are in place for night hours."],
    discussionQuestions: ["Is there anything in our current work area that could be organized better for safety?", "Are our spoil piles currently 2 feet or more from the excavation edge?", "What is our end-of-shift procedure for securing the excavation and site?"],
    remember: "A clean, organized site is a safe site. If you see something out of place, fix it now — do not wait for someone else to trip over it.",
  },
  {
    id: 27,
    week: 27,
    category: "Excavation Safety",
    title: "Deep Excavation Special Considerations",
    oshaRefs: ["29 CFR 1926.651", "29 CFR 1926.652"],
    overview: "Excavations exceeding 20 feet in depth require protective systems designed by a registered professional engineer. Deep excavations multiply every hazard: soil pressures are greater, rescue is more difficult, atmospheric hazards are more likely, and the consequences of any failure are magnified. Deep excavation work demands the highest level of planning and vigilance.",
    keyPoints: ["Excavations 20 feet or deeper MUST have a protective system designed by a registered professional engineer (PE). The PE's design must include calculations, detailed drawings, and specify the conditions under which the system is valid.", "Access and egress become more complex in deep excavations. Multiple ladders or stairways may be needed, and emergency evacuation time increases significantly.", "Atmospheric monitoring is more critical in deep excavations. Heavier-than-air gases (like carbon dioxide and methane) settle to the bottom. Continuous monitoring should be used, not just spot checks.", "Communication between workers at the bottom and supervisors at the top requires planning. Radios, wired communication systems, or other reliable methods must be established.", "Surcharge loading calculations become more important. Equipment vibration, adjacent structures, and even traffic loads have a greater impact on deep excavation stability.", "Rescue planning must account for the depth. Standard rescue equipment and techniques may not reach workers in deep excavations. Coordinate with local fire/rescue in advance."],
    discussionQuestions: ["What is the maximum depth we will reach on our current project, and do we have an engineered plan for that depth?", "How long would it take to evacuate a worker from the deepest point of our excavation?", "What special atmospheric hazards should we be monitoring for at depth on this project?"],
    remember: "Below 20 feet, everything changes. The forces are greater, the risks are higher, and there is no room for improvisation. Follow the engineer's plan exactly.",
  },
  {
    id: 28,
    week: 28,
    category: "Pile Driving Safety",
    title: "Pile Handling and Storage",
    oshaRefs: ["29 CFR 1926.250", "29 CFR 1926.251"],
    overview: "Steel H-piles, sheet piles, concrete piles, and timber piles are heavy, unwieldy, and potentially lethal if they shift, roll, or fall during handling and storage. Proper storage and rigging practices are the first step in every safe piling operation.",
    keyPoints: ["Store piles on firm, level ground. Use dunnage (wood blocking) to keep piles off the ground and to allow sling access for lifting. Block and chock round piles to prevent rolling.", "Sheet piles should be stored in interlocking bundles as received from the manufacturer whenever possible. If individual sheets must be stored, use racks or cribs designed for the purpose.", "When handling piles with a crane, use properly rated slings and spreader bars. Know the weight of each pile — a single 60-foot H-pile can weigh several tons.", "Tag lines must be attached to piles during hoisting to control swing and rotation. Never use your hands or body to guide a pile into position.", "Establish a clear drop zone and evacuation path before any pile is hoisted. Workers must be clear of the landing area and the travel path of the suspended pile.", "Concrete piles require special handling to prevent cracking. Follow the manufacturer's pick-point locations and never drag a concrete pile across the ground."],
    discussionQuestions: ["How are we currently storing piles on this site, and is it compliant with the requirements?", "What is the weight of the heaviest pile we are handling, and is our rigging rated for it?", "What is the evacuation plan if a pile breaks free during hoisting?"],
    remember: "A stored pile is a sleeping hazard. Improperly blocked or stacked piles can shift without warning and crush anyone in their path. Store them right, every time.",
  },
  {
    id: 29,
    week: 29,
    category: "Fall Protection",
    title: "Personal Fall Arrest Systems",
    oshaRefs: ["29 CFR 1926.502(d)", "29 CFR 1926.104"],
    overview: "When guardrails are not feasible — such as when working at the edge of a deep excavation, on top of shoring structures, or in pile driving leads — personal fall arrest systems (PFAS) may be required. A PFAS only works when it is properly selected, fitted, anchored, and inspected.",
    keyPoints: ["A complete PFAS consists of three components: a full-body harness, a connecting device (lanyard or self-retracting lifeline), and an anchor point rated for 5,000 pounds per worker or designed by a qualified person.", "The harness must fit snugly. A loose harness can shift during a fall, causing the D-ring to move and concentrating impact forces on vulnerable body parts. Adjust all straps before each use.", "Free fall distance must be limited to 6 feet or less, and the system must stop the worker before they contact any lower level. Calculate total fall distance including lanyard length, deceleration distance (3.5 feet), and harness stretch.", "Anchor points must be above the worker's D-ring height whenever possible. Anchoring at foot level greatly increases fall distance and impact force.", "Inspect all PFAS components before each use: check harness webbing for cuts, burns, and fraying; check lanyard and connectors for damage; verify that self-retracting lifelines retract smoothly.", "After any fall, the entire PFAS must be removed from service and inspected by a competent person. Many components are damaged during a fall even if they look intact."],
    discussionQuestions: ["Where are the designated anchor points for our fall arrest systems on the current project?", "Have you calculated the total fall distance for your PFAS based on where you typically anchor?", "When was the last time our harnesses and lanyards were formally inspected?"],
    remember: "A harness is not a magic suit of armor. It only protects you if it is fitted correctly, anchored properly, and inspected regularly.",
  },
  {
    id: 30,
    week: 30,
    category: "Shoring Operations",
    title: "Waler and Bracing Systems",
    oshaRefs: ["29 CFR 1926.652(c)"],
    overview: "Walers and cross braces are critical structural components that transfer loads from shoring members to create a unified support system. In deep excavations, the bracing system is what prevents the entire shoring assembly from moving inward. A failure in any waler or brace can cause a progressive collapse of the entire system.",
    keyPoints: ["Walers are horizontal members that run along the face of the shoring system, connecting multiple vertical elements (soldier piles, sheet piles, or uprights) and distributing loads evenly to the bracing.", "Cross braces (struts) span the width of the excavation and hold the opposing walls apart. They must be properly sized for the loads and the span, and must bear on firm connections at each end.", "Corner bracing and raker (inclined) bracing require special attention to connection details. The thrust force at the base of a raker must be resisted by an adequate footing or deadman.", "Preloading of braces (using hydraulic jacks to apply initial compression) may be specified by the engineer to minimize wall movement. Follow the specified preload values exactly.", "Monitor braces for signs of buckling, deflection, or connection failure. Any visible bowing in a strut is a critical warning that must be addressed immediately.", "Never remove or relocate a brace without the engineer's approval. The removal sequence during backfill must follow the engineer's plan to prevent wall movement."],
    discussionQuestions: ["What is the specified preload for the braces on our current shoring system?", "How do we inspect braces for buckling during the shift?", "What is the procedure if a brace connection shows signs of loosening or displacement?"],
    remember: "Every brace in the system is holding back thousands of pounds of soil pressure. Losing one can trigger a chain reaction. Never modify the bracing without engineering approval.",
  },
  {
    id: 31,
    week: 31,
    category: "General Safety",
    title: "Struck-By Hazard Awareness",
    oshaRefs: ["29 CFR 1926.600", "29 CFR 1926.602"],
    overview: "Struck-by incidents are one of OSHA's Focus Four hazards and one of the leading causes of construction fatalities. On shoring and piling projects, struck-by hazards come from every direction: falling objects from above, swinging loads, moving equipment, and rolling or shifting materials.",
    keyPoints: ["Falling objects: Never work directly under crane loads, pile driving hammers, or any overhead work. Establish and enforce drop zones with barricades and warning signs.", "Swinging objects: Sheet piles, H-beams, and lagging being moved by crane can swing unpredictably. Use tag lines and never position yourself in the swing path.", "Moving vehicles and equipment: Excavators, dump trucks, and loaders must use spotters when backing. Workers on foot must maintain eye contact with operators and stay out of the equipment's path.", "Rolling and shifting materials: Pipes, piles, and cylindrical objects can roll if not properly blocked. Stacked materials can shift if not stored correctly. Keep hands and feet clear when removing blocking.", "Ejected materials: Soil, rock, and debris can be thrown by excavator buckets, pile hammers, and cutting equipment. Stay at a safe distance and wear eye and face protection.", "Hard hats and high-visibility clothing are the minimum PPE for struck-by protection. They help, but the best protection is not being in the line of fire in the first place."],
    discussionQuestions: ["What are the top three struck-by hazards on our current project?", "When was the last time you had a near-miss struck-by incident? What did you learn from it?", "Are our drop zones and exclusion zones clearly marked and understood by everyone on site?"],
    remember: "The number one rule of struck-by prevention: Never place yourself in the line of fire. If something can fall, swing, roll, or move toward you, move somewhere else.",
  },
  {
    id: 32,
    week: 32,
    category: "Excavation Safety",
    title: "Adjacent Structures and Surcharge Loads",
    oshaRefs: ["29 CFR 1926.651(i)"],
    overview: "Excavating near existing buildings, roadways, utilities, and other structures creates additional loads on the excavation walls. These surcharge loads can destabilize protective systems that were designed only for soil pressure. Understanding and managing surcharge loads is essential for deep excavation safety.",
    keyPoints: ["A surcharge load is any additional weight or force applied to the ground near an excavation beyond the normal soil weight. Common sources include buildings, stored materials, spoil piles, heavy equipment, and vehicle traffic.", "OSHA requires that support systems (shoring, shielding) be designed to resist surcharge loads in addition to normal soil pressures. The competent person must identify all surcharge sources.", "Buildings adjacent to excavations may be undermined if the excavation extends below their foundation level. This requires underpinning, ground improvement, or engineered shoring designed for the building loads.", "Heavy equipment operating near the edge of an excavation creates dynamic surcharge loads. The minimum safe distance for equipment depends on soil type, excavation depth, and the equipment's weight.", "Vehicle traffic near excavations creates vibration and dynamic loading. Where possible, reroute traffic. Where traffic cannot be diverted, the shoring system must be designed for the additional load.", "Monitor adjacent structures for movement, cracking, or settlement during excavation. Survey markers, crack monitors, and tiltmeters provide early warning of problems."],
    discussionQuestions: ["What structures, roads, or heavy loads are near our current excavation?", "Does our shoring design account for the equipment we are operating near the excavation edge?", "Have we noticed any cracking or settlement in adjacent structures or pavement?"],
    remember: "Everything near your excavation is pushing on your shoring system. Know what loads are there, and make sure your system was designed to handle them.",
  },
  {
    id: 33,
    week: 33,
    category: "Electrical Safety",
    title: "Ground-Fault Circuit Interrupter (GFCI) Protection",
    oshaRefs: ["29 CFR 1926.404(b)(1)", "29 CFR 1926.405"],
    overview: "Ground-fault circuit interrupters save lives by shutting off electrical power when current leaks to ground — which is exactly what happens when a person becomes a path to ground. On wet, muddy job sites like ours, GFCI protection is not optional. It is the difference between a tripped breaker and an electrocution.",
    keyPoints: ["All 120-volt, single-phase, 15- and 20-ampere receptacle outlets on construction sites that are not part of the permanent wiring must be GFCI-protected. This applies to all temporary power on our sites.", "Test GFCIs before each use by pressing the TEST button. The power should shut off. Then press RESET to restore power. If the GFCI does not trip when tested, it is defective — do not use it.", "GFCI protection is especially critical in and around excavations where water, mud, and damp conditions are common. Moisture dramatically increases the risk of ground faults.", "Portable GFCI devices can be used where permanent GFCI outlets are not available. Keep portable GFCIs out of standing water and protect them from physical damage.", "Extension cords used on site must be of the three-wire grounding type. Two-wire cords and cords with missing grounding prongs must be removed from service immediately.", "An alternative to GFCIs is an Assured Equipment Grounding Conductor Program (AEGCP), which requires regular testing and documentation. Most sites use GFCIs because they provide immediate, automatic protection."],
    discussionQuestions: ["Did you test the GFCI on your power tools before starting work today?", "Are there any extension cords on site with damaged plugs or missing ground prongs?", "Where are the GFCI-protected outlets and portable GFCIs located on our site?"],
    remember: "A GFCI detects a ground fault in as little as 1/40th of a second. Without it, that fault flows through you. Test your GFCI every day — it takes five seconds.",
  },
  {
    id: 34,
    week: 34,
    category: "Heavy Equipment",
    title: "Equipment Pre-Operation Inspections",
    oshaRefs: ["29 CFR 1926.600", "29 CFR 1926.601"],
    overview: "Every piece of heavy equipment on our job sites — excavators, cranes, loaders, dump trucks, vibratory hammers — requires a pre-operation inspection before each shift. Equipment failures cause struck-by incidents, crush injuries, and can destabilize excavations. Pre-op inspections catch problems before they become emergencies.",
    keyPoints: ["Walk around the equipment before starting it. Check for fluid leaks (oil, hydraulic fluid, coolant), tire/track condition, structural damage, and any loose or missing components.", "Check all safety devices: backup alarms, mirrors, cameras, fire extinguishers, seat belts, ROPS (roll-over protective structures), and FOPS (falling object protective structures).", "Test all controls before putting the machine to work. Verify that hydraulic functions, steering, braking, and emergency shutoffs operate correctly.", "Check fluid levels: engine oil, hydraulic fluid, coolant, and fuel. Operating with low fluid levels can cause catastrophic equipment failure.", "Inspect wire ropes, chains, and rigging components on cranes and pile driving equipment. Look for broken wires, kinks, crushing, corrosion, and bird-caging in wire rope.", "Document your inspection. If deficiencies are found, report them and do not operate the equipment until repairs are made. Your inspection record is your defense if something goes wrong."],
    discussionQuestions: ["What is the most common deficiency you have found during a pre-operation inspection?", "Where are the pre-operation inspection forms for our equipment, and are they being completed daily?", "What would you do if you found a hydraulic leak during your pre-op inspection but were told to operate the machine anyway?"],
    remember: "A five-minute walk-around inspection can prevent a five-hour rescue operation. Never operate equipment that has not been inspected and found safe.",
  },
  {
    id: 35,
    week: 35,
    category: "Pile Driving Safety",
    title: "Impact Hammer Safety",
    oshaRefs: ["29 CFR 1926.603"],
    overview: "Impact hammers (diesel, hydraulic, and air/steam) generate tremendous force to drive piles into the ground. Each hammer strike produces violent noise, vibration, and the potential for flying debris. Working around impact hammers requires strict safety protocols and constant awareness.",
    keyPoints: ["Diesel hammers can produce noise levels exceeding 120 dB per strike. At this level, even brief unprotected exposure causes permanent hearing damage. Double hearing protection (plugs and muffs) is mandatory.", "Before each shift, inspect the hammer, leads, cushion blocks, and connections. A cracked or worn cushion block can cause the hammer to strike unevenly, damaging the pile and creating projectile hazards.", "The pile cap and driving helmet must be properly matched to the pile being driven. An improperly fitted cap can cause the pile to buckle, kick, or eject from the leads.", "Exhaust from diesel hammers is hot and may contain carbon monoxide. Position workers upwind when possible and ensure adequate ventilation.", "When starting a diesel hammer, all personnel must be clear of the leads and the hammer drop zone. Diesel hammers can fire unexpectedly if fuel has accumulated.", "Immediately stop driving and inspect if the pile suddenly stops advancing, the hammer begins bouncing excessively, or the pile begins to drift off alignment. These conditions indicate a problem that will get worse, not better."],
    discussionQuestions: ["What type of impact hammer are we using on the current project, and what is its rated energy?", "When was the last time the cushion block was inspected or replaced?", "What is the stop-work criteria for pile driving refusal on our project?"],
    remember: "An impact hammer delivers the energy equivalent of a car crash with every strike. Respect the force, maintain the equipment, and stay clear of the leads.",
  },
  {
    id: 36,
    week: 36,
    category: "General Safety",
    title: "Cold Weather Safety",
    oshaRefs: ["General Duty Clause Section 5(a)(1)"],
    overview: "Cold weather creates unique hazards for excavation and piling crews. Hypothermia, frostbite, reduced dexterity, icy surfaces, and frozen ground conditions all increase the risk of injury. Cold weather also affects equipment performance and soil behavior in ways that can compromise safety.",
    keyPoints: ["Hypothermia can occur at temperatures well above freezing, especially when workers are exposed to wind and moisture. Watch for shivering, confusion, slurred speech, and drowsiness — these are early warning signs.", "Frostbite affects exposed skin and extremities. In windy conditions, frostbite can occur in minutes. Provide adequate cold-weather PPE including insulated gloves, thermal layers, and face protection.", "Frozen ground at the surface can mask unstable soil below. When the surface thaws, it can release suddenly. The competent person must account for freeze/thaw cycles in soil classification.", "Ice on ladders, walkways, and equipment creates extreme slip and fall hazards. De-ice access points, use sand or grit on walking surfaces, and inspect ladders before each use.", "Cold weather reduces battery capacity in equipment and monitoring instruments. Check battery-powered safety equipment (atmospheric monitors, radios) more frequently in cold conditions.", "Warm-up breaks must be provided. Workers who lose dexterity from cold hands are more likely to drop tools, miss handholds, and make errors during critical operations like rigging and shoring installation."],
    discussionQuestions: ["What cold-weather PPE is available for our crew, and is it adequate for today's conditions?", "How does a freeze/thaw cycle affect the soil classification at our excavation?", "What is our warm-up break schedule when temperatures drop below freezing?"],
    remember: "Cold does not just make you uncomfortable — it makes you clumsy, slow, and impairs your judgment. Dress for the conditions and take breaks before you lose dexterity.",
  },
  {
    id: 37,
    week: 37,
    category: "Shoring Operations",
    title: "Shoring Removal and Backfill Procedures",
    oshaRefs: ["29 CFR 1926.651(j)", "29 CFR 1926.652"],
    overview: "Removing shoring during backfill is one of the most dangerous phases of excavation work. As shoring components are removed, the soil they were holding back is temporarily unsupported. Workers have been killed during shoring removal when they underestimated the remaining soil pressure. A careful, engineered removal sequence is critical.",
    keyPoints: ["Shoring must be removed from the bottom up, in the reverse order of installation. As each level of bracing is removed, backfill must be placed and compacted to replace the support that was provided by the shoring.", "The engineer's removal plan must be followed exactly. It specifies which members can be removed at each stage and how much backfill must be in place before the next member is removed.", "Never remove all bracing at once. Even with partial backfill in place, the soil pressure on the upper portions of the shoring wall can cause inward movement if the lower braces are removed prematurely.", "Workers should not be in the excavation during shoring removal if it can be avoided. Use mechanical means to remove bracing and shoring components whenever possible.", "Monitor the excavation walls throughout the removal process. Watch for bulging, cracking, or soil movement that indicates the wall is under stress.", "Backfill material must be placed and compacted in lifts as specified by the engineer. Dumping large quantities of loose fill does not provide the same support as properly compacted lifts."],
    discussionQuestions: ["What is the engineer's specified removal sequence for our current shoring system?", "Can our shoring be removed mechanically, or will workers need to be in the excavation?", "How do we verify that backfill is adequately compacted before removing the next level of shoring?"],
    remember: "The excavation is not safe until the last piece of shoring is out and the backfill is complete. Shoring removal is not the end of the job — it is the most critical part.",
  },
  {
    id: 38,
    week: 38,
    category: "Fall Protection",
    title: "Walking and Working Surfaces",
    oshaRefs: ["29 CFR 1926.501", "29 CFR 1926.502"],
    overview: "The ground around excavations and piling operations is rarely flat, stable, or dry. Uneven terrain, mud, loose spoil, construction debris, and wet steel surfaces all create slip, trip, and fall hazards. These seemingly minor hazards account for a large percentage of construction injuries.",
    keyPoints: ["Keep all walking and working surfaces as clean and dry as practical. On excavation sites, this means managing mud, controlling water runoff, and maintaining access paths.", "Ramps used for worker access to excavations must be designed by a competent person if used by employees as a means of egress. Ramps must have cleats or other anti-slip surfaces.", "Steel plates, sheet piles, and H-beams become extremely slippery when wet. Use anti-slip coatings, temporary grip tape, or grit on surfaces where workers must walk.", "Uneven ground near excavation edges is especially dangerous. Soft or loose soil near the edge can give way underfoot, causing workers to slide into the excavation.", "Temporary walkways and access paths should be clearly marked, well-lit, and maintained throughout the project. Do not allow workers to take shortcuts across unstable or cluttered areas.", "Report any surface conditions that create a slip, trip, or fall hazard. It is everyone's responsibility to identify and correct these hazards before an injury occurs."],
    discussionQuestions: ["What are the biggest slip, trip, or fall hazards on our current site right now?", "Are our access ramps equipped with anti-slip surfaces and in good condition?", "How do we manage walking surfaces after rain or when dewatering creates muddy conditions?"],
    remember: "You do not need to fall 20 feet to get hurt. A slip on wet steel or a trip over a hose can put you out of work just as fast. Watch your step.",
  },
  {
    id: 39,
    week: 39,
    category: "Excavation Safety",
    title: "Trench Rescue Awareness",
    oshaRefs: ["29 CFR 1926.651", "29 CFR 1926.650"],
    overview: "A cave-in can bury a worker in seconds. One cubic yard of soil weighs approximately 3,000 pounds. A worker buried chest-deep cannot breathe due to the pressure and will suffocate in minutes if not rescued. Trench rescue is an extremely specialized operation, and the wrong response can make things worse.",
    keyPoints: ["In a cave-in, call 911 IMMEDIATELY and request a technical rescue team. Do not enter the excavation to attempt a rescue — the soil that collapsed once is likely to collapse again. Rescuer deaths are common in cave-in incidents.", "If you can safely reach the victim without entering the excavation (for example, if they are partially buried near the surface), try to keep their airway clear while waiting for rescue.", "A victim buried to the waist or deeper requires technical rescue with shoring panels placed around them to prevent further collapse. This equipment and training are beyond what our crews carry.", "Time is critical: a fully buried victim has approximately 4–6 minutes before suffocation. This is why prevention is far more important than rescue capability.", "Pre-plan your emergency response: know the nearest hospital and trauma center, confirm that local fire/rescue has trench rescue capability, and share your site location and access information with them in advance.", "Every worker should know the signs of impending collapse: soil cracking at the edge, small slides, water seepage increasing, and bulging or bowing of shoring components."],
    discussionQuestions: ["Does our local fire department have a technical trench rescue team, and have we coordinated with them?", "If a cave-in happened right now, who would make the 911 call and what information would they provide?", "What are the warning signs of an impending cave-in that we should all be watching for?"],
    remember: "The best trench rescue is the one that never happens. Follow the protective system requirements, trust the competent person, and if conditions change, get out and reassess.",
  },
  {
    id: 40,
    week: 40,
    category: "Heavy Equipment",
    title: "Forklift and Material Handling Safety",
    oshaRefs: ["29 CFR 1926.602(d)", "29 CFR 1910.178"],
    overview: "Forklifts and rough terrain material handlers are used on our sites to move shoring components, pile sections, tools, and supplies. These machines have a high center of gravity, limited visibility, and are often operated on uneven ground near open excavations — a dangerous combination.",
    keyPoints: ["Only trained and authorized operators may operate forklifts. Training must include the specific type of forklift being used and the conditions of the work environment.", "Never operate a forklift near an unprotected excavation edge. The ground near excavations may be weakened and unable to support the combined weight of the forklift and its load.", "Travel with the load as low as possible (6 inches off the ground) and tilted back. On grades, travel with the load uphill. Never drive across a slope with an elevated load.", "Seatbelts must be worn at all times. If the forklift tips over, the ROPS protects the operator only if they remain in the seat. Being thrown from a tipping forklift is the number one cause of forklift fatalities.", "Workers must never ride on the forks or stand under an elevated load. Use an approved work platform with guardrails if a forklift must be used for elevated personnel access.", "Check tire conditions, particularly on rough terrain forklifts. Pneumatic tires can deflate on construction debris, causing the machine to become unstable."],
    discussionQuestions: ["Who on our crew is trained and authorized to operate the forklift?", "What is the minimum safe distance our forklift should operate from the excavation edge?", "When was the last time the forklift received a daily pre-operation inspection?"],
    remember: "A loaded forklift weighs as much as a car. It can crush, tip, and run over workers in an instant. Respect the machine and its limitations.",
  },
  {
    id: 41,
    week: 41,
    category: "Shoring Operations",
    title: "Tieback and Anchor Systems",
    oshaRefs: ["29 CFR 1926.652(c)"],
    overview: "When cross bracing is not feasible due to the width of the excavation or because clear interior space is needed, tieback anchors provide lateral support for shoring walls. These systems transfer soil pressure into the ground behind the wall through grouted anchors or deadman systems. They are engineered systems that require precise installation and ongoing monitoring.",
    keyPoints: ["Tieback systems must be designed by a registered professional engineer. The design specifies anchor type, capacity, angle, depth, free length, bonded length, and pre-stress requirements.", "Tieback installation involves drilling through or behind the shoring wall, installing a tendon (steel bar or cable strand), grouting the anchor zone, and stressing the tendon to the design load. Each step has specific safety requirements.", "Proof testing of tiebacks verifies that each anchor can hold the design load with an adequate safety factor. Tiebacks that fail testing must be replaced or supplemented per the engineer's direction.", "Workers must stay clear of the area behind the drill rig during anchor installation. If a tieback breaks during stressing, the tendon can recoil with lethal force.", "Tieback heads (bearing plates and lock-off hardware) must be protected and monitored. Load cells on selected tiebacks can provide real-time data on whether the system is performing as designed.", "Do not pile materials on or drive equipment over tieback locations. The ground behind the wall is part of the structural system — additional loading can pull the anchors out."],
    discussionQuestions: ["Are we using tieback anchors on our current project, and what are the design loads?", "How are tieback proof tests documented, and where are those records kept?", "What is the exclusion zone behind the wall where tiebacks are installed?"],
    remember: "A tieback is a lifeline anchored in the earth. It cannot be relocated, overloaded, or ignored. Respect the engineer's layout and protect the ground behind the wall.",
  },
  {
    id: 42,
    week: 42,
    category: "General Safety",
    title: "Incident Reporting and Near Misses",
    oshaRefs: ["29 CFR 1904", "29 CFR 1926.35"],
    overview: "Every incident and near miss on our job sites is a learning opportunity. A near miss is a warning that our safety systems have a gap — it is an incident where no one was hurt, this time. Reporting these events honestly and without fear of punishment is how we prevent the next injury.",
    keyPoints: ["OSHA requires that employers record and report certain workplace injuries and illnesses. Fatalities must be reported within 8 hours, and hospitalizations, amputations, or loss of an eye within 24 hours.", "Near-miss reporting should be encouraged and rewarded. Studies show that for every serious injury, there are approximately 300 near-miss events. Each one is a chance to identify and fix a hazard before someone gets hurt.", "Report all incidents and near misses to your supervisor immediately, no matter how minor they seem. A small cut today could indicate a hazard that causes a serious injury tomorrow.", "Investigation of incidents should focus on finding root causes, not blaming individuals. Ask 'Why did this happen?' five times to get past the obvious causes to the underlying system failures.", "Document everything: who was involved, what happened, when and where it occurred, what conditions were present, and what could be done differently. Take photos if possible.", "Share lessons learned from incidents and near misses with the entire crew during tailgate meetings. What happened on one crew's project can save a life on another."],
    discussionQuestions: ["Have there been any near-miss incidents on our site recently that we can learn from?", "Do you feel comfortable reporting near misses without fear of being blamed or punished?", "What is the process for reporting an incident on our site, and does everyone know it?"],
    remember: "A near miss is a free lesson. A reported near miss is a lesson the whole team can learn from. Report everything — the life you save may be your coworker's.",
  },
  {
    id: 43,
    week: 43,
    category: "Excavation Safety",
    title: "Cofferdams and Work in Water",
    oshaRefs: ["29 CFR 1926.802"],
    overview: "Cofferdams are temporary enclosures built within, or in pairs across, a body of water to allow construction work to be performed in the dry. Our work frequently requires cofferdams for bridge foundations, waterfront structures, and utility installations near waterways. These structures present unique hazards including flooding, structural failure, and drowning.",
    keyPoints: ["Cofferdams must be designed by a registered professional engineer and constructed to withstand all expected water pressures, wave action, and current forces with an adequate safety factor.", "Life jackets (USCG-approved Type III or better) must be available and worn by any worker exposed to drowning hazards. Ring buoys with at least 90 feet of line must be placed every 200 feet along the water's edge.", "Cofferdam dewatering must be monitored continuously. Pump failure can cause rapid flooding. Backup pumps and an emergency evacuation plan must be in place.", "Water levels must be monitored upstream and downstream. A sudden rise in water level from storm events, dam releases, or tidal changes can overtop or destabilize the cofferdam.", "Means of egress (ladders or stairs) from within the cofferdam must be provided and accessible at all times. Workers must be able to evacuate quickly if the cofferdam is overtopped or breached.", "Atmospheric hazards inside cofferdams are similar to those in deep excavations: oxygen deficiency, methane from underwater soil, and buildup of equipment exhaust. Monitor continuously."],
    discussionQuestions: ["If we work in or near water on upcoming projects, what is our drowning prevention plan?", "How would we evacuate a cofferdam if the pumps failed and water began rising?", "What is the upstream flood warning system for our waterway projects?"],
    remember: "Water is patient and powerful. A cofferdam is holding it back, but it is always looking for a way in. Monitor your pumps, your walls, and the weather — constantly.",
  },
  {
    id: 44,
    week: 44,
    category: "Electrical Safety",
    title: "Temporary Electrical Installations",
    oshaRefs: ["29 CFR 1926.405", "29 CFR 1926.404"],
    overview: "Construction sites rely on temporary electrical systems to power tools, lighting, dewatering pumps, and equipment. These temporary installations are exposed to weather, physical damage, and the harsh conditions of excavation work. Improperly installed or damaged temporary electrical systems are a constant source of electrocution and fire hazards.",
    keyPoints: ["Temporary electrical panels must be installed by a qualified electrician. Panels must be weatherproof, properly grounded, and protected from physical damage by equipment and materials.", "All temporary wiring must be supported and secured to prevent damage. Cords and cables must not be run through doorways, windows, or holes in walls unless protected by bushings or equivalent. On our sites, keep cords clear of excavation edges and equipment traffic.", "Temporary lighting must be protected by guards to prevent contact and breakage. In excavations, use low-voltage lighting systems or GFCI-protected circuits to reduce electrocution risk.", "Wet conditions on our sites require extra precautions: use watertight connectors, keep connections elevated above standing water, and ensure all circuits are GFCI-protected.", "Inspect temporary electrical installations at the start of each shift. Look for damaged insulation, exposed wires, overloaded circuits, missing covers on junction boxes, and tripped breakers.", "Never use temporary electrical equipment for purposes beyond its rating. Daisy-chaining extension cords, overloading circuits, and using undersized cords for heavy equipment are fire and electrocution hazards."],
    discussionQuestions: ["Where is our temporary electrical panel located, and is it protected from weather and physical damage?", "Are there any extension cords on site that are daisy-chained or running through areas where they could be damaged?", "When was the last time our temporary electrical installation was inspected by a qualified electrician?"],
    remember: "Temporary does not mean less dangerous. Temporary electrical systems kill just as effectively as permanent ones. Install them right, protect them, and inspect them daily.",
  },
  {
    id: 45,
    week: 45,
    category: "Pile Driving Safety",
    title: "Concrete Pile Installation Safety",
    oshaRefs: ["29 CFR 1926.603", "29 CFR 1926.251", "29 CFR 1926.701"],
    overview: "Precast concrete piles are heavy, brittle compared to steel, and can crack or break catastrophically if mishandled. Driving concrete piles requires careful attention to handling procedures, cushioning systems, driving stresses, and alignment to prevent pile damage and worker injuries.",
    keyPoints: ["Concrete piles must be picked up only at the designated pick points marked by the manufacturer. Lifting at incorrect points can crack the pile, creating a structural failure waiting to happen.", "A pile cushion (plywood, hardwood, or specialized material) must be used between the hammer and the pile cap to distribute the impact force. Monitor the cushion condition throughout driving and replace when it deteriorates.", "Concrete piles are susceptible to tension cracking during driving, especially in hard driving conditions. If driving resistance increases suddenly, stop and consult the engineer before continuing.", "Splicing concrete piles in the field requires engineered splice connections. Improper splices can fail under driving stresses or service loads.", "Concrete pile cutoff operations generate hazardous dust, flying debris, and noise. Workers performing cutoffs must wear eye protection, hearing protection, respiratory protection, and must barricade the area.", "Broken or damaged concrete piles must be carefully removed from the leads. A cracked pile under the hammer can shatter, sending heavy concrete fragments in all directions."],
    discussionQuestions: ["What cushion material are we using, and how often are we checking its condition?", "What is the driving criteria (blow count, set per blow) that tells us when to stop driving?", "What is the procedure if a concrete pile cracks during driving?"],
    remember: "Concrete is strong in compression but weak in tension. Every impact from the hammer creates both. Handle with care, cushion properly, and watch for cracks.",
  },
  {
    id: 46,
    week: 46,
    category: "General Safety",
    title: "First Aid and CPR Awareness",
    oshaRefs: ["29 CFR 1926.50"],
    overview: "On remote job sites or when emergency response times are extended, the first aid provided by coworkers can mean the difference between life and death. OSHA requires first aid supplies and, when medical facilities are not reasonably accessible, a person trained in first aid must be available on site.",
    keyPoints: ["At least one person on each crew should be currently certified in first aid and CPR. Verify that certifications are current, not expired.", "First aid kits must be available on site and stocked for the types of injuries most likely to occur. For our work, this includes supplies for lacerations, crush injuries, eye injuries, and heat/cold emergencies.", "Know the location of the nearest AED (automated external defibrillator). Sudden cardiac arrest can occur from electrocution, heat stroke, or pre-existing conditions. An AED dramatically improves survival rates when used within the first few minutes.", "For severe bleeding, apply direct pressure with a clean dressing. If bleeding is life-threatening and cannot be controlled with direct pressure, apply a tourniquet high and tight on the limb. Note the time of application.", "For a suspected spinal injury, do not move the victim unless they are in immediate danger (such as a collapsing excavation). Stabilize the head and neck and wait for EMS.", "Post emergency numbers, the site address, and directions to the site at a visible location. In an emergency, the person making the 911 call may be too stressed to remember these details."],
    discussionQuestions: ["Who on our crew is currently certified in first aid and CPR?", "Where is the first aid kit on our current site, and when was it last checked for completeness?", "Can you give clear directions from the nearest main road to our job site for an ambulance?"],
    remember: "You do not need to be a paramedic to save a life. Basic first aid — stopping bleeding, clearing an airway, calling 911 — buys time until the professionals arrive.",
  },
  {
    id: 47,
    week: 47,
    category: "Excavation Safety",
    title: "Excavation Inspection Checklist Review",
    oshaRefs: ["29 CFR 1926.651(k)", "29 CFR 1926.652"],
    overview: "The daily excavation inspection by the competent person is the single most important safety activity on our projects. This week, we review the inspection checklist point by point to ensure everyone understands what is being checked, why it matters, and what the warning signs look like.",
    keyPoints: ["Surface conditions: Check for cracks, bulges, or settling at the surface near excavation edges. These indicate soil movement that could precede a cave-in.", "Protective system integrity: Inspect all shoring members, braces, connections, and hydraulic pressures. Look for any displacement, bowing, or loosening of components.", "Water conditions: Check for water seepage, accumulation, and the status of dewatering equipment. Verify that surface water is being diverted away from the excavation.", "Means of egress: Confirm that ladders, ramps, or steps are in place, properly positioned, and within 25 feet of all workers. Verify the 3-foot extension above the excavation surface.", "Atmospheric conditions: Test for oxygen, flammable gas, and toxic gas levels when required. Verify that ventilation equipment is operating correctly.", "Adjacent structures and surcharge: Check for movement or cracking in nearby structures. Verify that spoil piles, equipment, and materials are at least 2 feet from the edge."],
    discussionQuestions: ["Can you walk through the excavation inspection checklist for our current site?", "What condition would cause you to immediately evacuate the excavation?", "Are the inspection records for this project being documented and filed correctly?"],
    remember: "The inspection checklist is not paperwork — it is a systematic safety review. Every checkbox represents a hazard that could kill someone if it goes unchecked.",
  },
  {
    id: 48,
    week: 48,
    category: "Heavy Equipment",
    title: "Dump Truck and Haul Road Safety",
    oshaRefs: ["29 CFR 1926.601", "29 CFR 1926.602"],
    overview: "Dump trucks move thousands of tons of spoil and backfill material on our projects. They operate in tight spaces, near open excavations, around workers on foot, and on temporary haul roads that may be uneven, muddy, or poorly maintained. Struck-by and run-over incidents with dump trucks are preventable but remain too common.",
    keyPoints: ["Spotters must be used whenever a dump truck is backing up near an excavation, workers on foot, or any obstruction. The spotter must maintain eye contact with the driver at all times.", "Haul roads must be maintained with adequate width for two-way traffic or designated as one-way. Blind corners must have mirrors, signage, or flaggers.", "Dump trucks must not be operated within 2 feet of an excavation edge. A loaded dump truck can weigh 50,000 pounds or more — more than enough to cause a cave-in by simply driving too close.", "Before dumping near an excavation, check that the ground can support the truck and that the dump body will clear overhead obstructions (power lines, structures).", "Drivers must set the parking brake and chock wheels before leaving the cab. On grades, additional precautions (turning wheels into a berm or curb) are required.", "Inspect tires, brakes, backup alarms, mirrors, and lights before each shift. Wet, muddy brakes can fail without warning on haul roads."],
    discussionQuestions: ["What is the designated haul route on our current site, and is it clearly marked?", "Are spotters being used consistently when trucks back up near the excavation?", "How close to the excavation edge are our trucks operating, and is that distance adequate?"],
    remember: "A dump truck driver cannot see directly behind and below the truck. If you are walking behind a dump truck and the backup alarm goes off, you are already in the danger zone. Move immediately.",
  },
  {
    id: 49,
    week: 49,
    category: "Shoring Operations",
    title: "Monitoring and Instrumentation",
    oshaRefs: ["29 CFR 1926.651(k)", "29 CFR 1926.652"],
    overview: "On deep excavation and shoring projects, visual inspection alone is not always sufficient to detect dangerous conditions. Survey instruments, inclinometers, strain gauges, load cells, and settlement monitors provide early warning of ground movement and shoring system performance changes that the human eye cannot detect.",
    keyPoints: ["Survey monitoring establishes baseline positions for shoring elements, adjacent structures, and ground surface points. Regular re-measurement detects movement trends before they become dangerous.", "Inclinometers measure lateral ground movement at various depths within the soil. They can detect wall movement deep below the surface before it becomes visible at the top.", "Load cells on braces and tiebacks measure the actual forces in the support system. Comparing actual loads to design loads tells the engineer whether the system is performing as intended.", "Settlement points on adjacent structures and pavement detect vertical movement caused by the excavation. Settlement often precedes more serious structural damage.", "Vibration monitors measure ground vibration from pile driving, equipment, and traffic. They provide data to protect against claims and to verify that vibration levels remain within acceptable limits.", "All monitoring data must be recorded, reviewed by the engineer, and acted upon promptly. Trigger levels (alert, action, and alarm) should be established before excavation begins so that everyone knows when intervention is needed."],
    discussionQuestions: ["What monitoring instruments are installed on our current project, and who reads them?", "What are the trigger levels for movement or load on our project, and what happens if they are exceeded?", "How frequently is monitoring data being collected and reviewed?"],
    remember: "Instruments do not prevent failures — they warn you before failures happen. But only if you read them, report the data, and act on the warnings.",
  },
  {
    id: 50,
    week: 50,
    category: "Fall Protection",
    title: "Guardrail Systems and Barricades",
    oshaRefs: ["29 CFR 1926.502(b)", "29 CFR 1926.502(f)"],
    overview: "Guardrails and barricades are the primary means of preventing falls into excavations and restricting access to hazardous areas. They are simple safety systems that are often poorly constructed, damaged, or inadequately maintained. A guardrail that cannot stop a fall is worse than no guardrail at all because workers trust it.",
    keyPoints: ["Standard guardrail systems require a top rail at 42 inches (plus or minus 3 inches), a mid rail at 21 inches, and a toeboard at least 4 inches high when there is a risk of objects falling to a lower level.", "The top rail must withstand at least 200 pounds of force applied in any outward or downward direction at any point along its length. Posts must withstand 200 pounds of force applied in any direction.", "Wire rope used as a top rail must be flagged with high-visibility material every 6 feet and must be kept taut at all times.", "Barricade tape (caution tape) is NOT a guardrail. It is a visual warning only. It provides zero fall protection. If workers must work near the excavation edge, a proper guardrail or personal fall arrest system is required.", "Guardrails around excavations must be inspected daily and after any event (equipment contact, heavy wind, soil movement) that could compromise their integrity.", "Openings in guardrail systems for equipment or material access must be protected with a gate or other means when not in use."],
    discussionQuestions: ["Are the guardrails around our excavation currently meeting the 42-inch height requirement?", "Have any of our guardrails been hit by equipment or compromised recently?", "Are there any areas where we are relying on barricade tape instead of a proper guardrail?"],
    remember: "A guardrail is a safety system, not a suggestion. Build it to standard, inspect it daily, and fix it immediately if it is damaged. Workers trust it with their lives.",
  },
  {
    id: 51,
    week: 51,
    category: "General Safety",
    title: "Safety Culture and Stop Work Authority",
    oshaRefs: ["General Duty Clause Section 5(a)(1)"],
    overview: "Every safety program, regulation, and piece of equipment is only as effective as the culture that supports it. A strong safety culture means that every worker feels empowered and obligated to stop work when they see something unsafe — without fear of retaliation, no matter who is watching.",
    keyPoints: ["Every worker on this site has the right and the responsibility to stop work if they believe conditions are unsafe. This authority cannot be taken away by any supervisor, foreman, or owner.", "Stop Work Authority is not insubordination — it is leadership. A worker who stops an unsafe operation may be preventing a fatality. This should be recognized and respected.", "Retaliation against a worker who exercises Stop Work Authority is illegal under OSHA's whistleblower protections (Section 11(c) of the OSH Act).", "Speaking up about safety concerns should be encouraged at every level. If someone raises a concern and is ignored or punished, the entire crew's safety is compromised because others will stop speaking up.", "Safety culture is built through consistent behavior: leaders who follow the rules themselves, crews who look out for each other, and a reporting system that treats every concern seriously.", "At the end of every day, the goal is for everyone to go home the same way they arrived. No deadline, no production target, and no project milestone is worth a life."],
    discussionQuestions: ["Have you ever felt uncomfortable about a safety condition but did not speak up? What held you back?", "What would you do if you saw a coworker doing something unsafe?", "How can we make it easier for everyone on this crew to raise safety concerns?"],
    remember: "You have the right to stop work for safety. You have the responsibility to stop work for safety. Use it. No one should go home hurt because someone was afraid to speak up.",
  },
  {
    id: 52,
    week: 52,
    category: "Year-End Review",
    title: "Annual Safety Review and Goals",
    oshaRefs: ["29 CFR 1926.20", "29 CFR 1926.21"],
    overview: "This is our final tailgate meeting of the safety year. Today we review what we have learned, recognize our safety achievements, identify areas for improvement, and set goals for the coming year. Safety is not a destination — it is a continuous journey that requires commitment every single day.",
    keyPoints: ["Review the year's safety record: number of incidents, near misses reported, days without a lost-time injury, and any trends or patterns in the types of events that occurred.", "Identify the safety topics that resonated most with the crew and the ones that need more emphasis. Were there topics we covered that directly prevented an incident?", "Recognize individuals and crews who demonstrated outstanding safety leadership, consistent PPE compliance, and active participation in the safety program.", "Review changes in regulations, equipment, or procedures that occurred during the year and verify that all workers are up to date on the changes.", "Set measurable safety goals for the coming year: increase near-miss reporting, achieve zero lost-time injuries, complete specific training certifications, improve housekeeping scores, or reduce equipment damage incidents.", "Solicit feedback from every crew member: What topics should we add? What training do you need? What site conditions concern you most? Your input shapes next year's safety program."],
    discussionQuestions: ["What was the most important safety lesson you learned this year?", "What safety goal would you set for our crew for the coming year?", "Is there a safety topic we did not cover this year that you think we should add?"],
    remember: "52 weeks of tailgate meetings is a commitment, and you made it. But safety is not a program you complete — it is a way of working. Keep learning, keep watching out for each other, and keep going home safe.",
  },
];


const TOPICS = SAFETY_TOPICS; // Local alias
const CATEGORIES = [...new Set(SAFETY_TOPICS.map(t => t.category))];
export const CAT_COLORS = {
  "Excavation Safety": { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  "Shoring Operations": { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  "Pile Driving Safety": { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
  "Fall Protection": { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  "Electrical Safety": { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  "Heavy Equipment": { bg: "#ffedd5", text: "#9a3412", dot: "#f97316" },
  "General Safety": { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "Year-End Review": { bg: "#e0e7ff", text: "#3730a3", dot: "#6366f1" },
};

// ─── SIGNATURE PAD COMPONENT ───────────────────────────────────────
function SignaturePad({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#1a3a5c";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const endDraw = () => setIsDrawing(false);

  const clearSig = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSave = () => {
    if (!name.trim() || !hasSignature) return;
    const dataUrl = canvasRef.current.toDataURL();
    onSave({ name: name.trim(), signature: dataUrl, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    setName("");
    clearSig();
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
          Print Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter full name"
          style={{
            width: "100%", padding: "10px 14px", fontSize: 16, border: "2px solid #e2e8f0",
            borderRadius: 10, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
          }}
          onFocus={(e) => e.target.style.borderColor = "#e87722"}
          onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
        />
      </div>

      <label style={{ fontSize: 13, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
        Signature
      </label>
      <div style={{ position: "relative", border: "2px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fafbfc" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: 120, touchAction: "none", cursor: "crosshair" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        {!hasSignature && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            color: "#94a3b8", fontSize: 14, pointerEvents: "none" }}>
            Sign here
          </div>
        )}
        <button onClick={clearSig}
          style={{ position: "absolute", top: 6, right: 6, background: "#f1f5f9", border: "none",
            borderRadius: 6, padding: "4px 8px", fontSize: 11, color: "#64748b", cursor: "pointer" }}>
          Clear
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={onCancel}
          style={{ flex: 1, padding: "12px", fontSize: 15, fontWeight: 600, border: "2px solid #e2e8f0",
            borderRadius: 10, background: "#fff", color: "#475569", cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handleSave}
          disabled={!name.trim() || !hasSignature}
          style={{
            flex: 2, padding: "12px", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 10,
            background: (!name.trim() || !hasSignature) ? "#cbd5e1" : "#e87722", color: "#fff",
            cursor: (!name.trim() || !hasSignature) ? "default" : "pointer",
            opacity: (!name.trim() || !hasSignature) ? 0.6 : 1,
          }}>
          Save Signature
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function SafetyMeetings({ state, dispatch }) {
  // Get active project from parent state
  const activeProject = state.projects?.find(p => p.id === state.activeProjectId);
  const currentProject = activeProject?.jobName || "No Project Selected";

  // State
  const [screen, setScreen] = useState("topics");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [downloaded, setDownloaded] = useState({});
  const [presented, setPresented] = useState({});
  const [meetings, setMeetings] = useState({});
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [showSigPad, setShowSigPad] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const toast = useCallback((msg, type = "success") => {
    setShowToast({ msg, type });
    setTimeout(() => setShowToast(null), 2600);
  }, []);

  // Filter topics
  const filteredTopics = TOPICS.filter(t => {
    const matchSearch = searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `week ${t.week}`.includes(searchQuery.toLowerCase());
    const matchCat = filterCat === "All" || t.category === filterCat;
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "downloaded" && downloaded[t.id]) ||
      (filterStatus === "not-downloaded" && !downloaded[t.id]);
    return matchSearch && matchCat && matchStatus;
  });

  const downloadCount = Object.keys(downloaded).length;
  const presentedCount = Object.keys(presented).length;

  // ─── RENDER HELPERS ─────────────────────────────────────────────
  const TopBar = ({ title, onBack, rightAction }) => (
    <div style={{
      display: "flex", alignItems: "center", padding: "14px 16px", background: "#1a3a5c",
      color: "#fff", position: "sticky", top: 0, zIndex: 100,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff",
          cursor: "pointer", padding: "4px 8px 4px 0", display: "flex", alignItems: "center" }}>
          <ChevronLeft size={22} />
        </button>
      )}
      <span style={{ flex: 1, fontSize: 17, fontWeight: 700, letterSpacing: 0.3 }}>{title}</span>
      {rightAction}
    </div>
  );

  const StatusPill = ({ downloaded: dl, presented: pr }) => {
    if (pr) return (
      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
        background: "#dcfce7", color: "#166534" }}>
        Presented {pr.date}
      </span>
    );
    if (dl) return (
      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
        background: "#dbeafe", color: "#1e40af" }}>
        Downloaded
      </span>
    );
    return null;
  };

  const CatBadge = ({ cat }) => {
    const c = CAT_COLORS[cat] || { bg: "#f1f5f9", text: "#475569" };
    return (
      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
        background: c.bg, color: c.text }}>
        {cat}
      </span>
    );
  };

  // ─── SCREENS ──────────────────────────────────────────────────────

  // TOPIC LIST SCREEN (default)
  if (screen === "topics") {
    const displayTopics = isOnline ? filteredTopics : filteredTopics.filter(t => downloaded[t.id]);
    return (
      <div style={{ background: "#f8fafc", fontFamily: "'Inter','SF Pro Display',-apple-system,sans-serif", minHeight: "100vh" }}>
        <TopBar title="Safety Topics" onBack={() => { setSearchQuery(""); setFilterCat("All"); setFilterStatus("all"); }}
          rightAction={
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ background: showFilters ? "rgba(232,119,34,0.3)" : "rgba(255,255,255,0.15)",
                border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff" }}>
              <Filter size={18} />
            </button>
          }
        />

        {/* Search */}
        <div style={{ padding: "12px 16px 8px", position: "sticky", top: 49, background: "#f8fafc", zIndex: 90 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: 12, top: 11 }} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, categories, or week #..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", fontSize: 14, border: "2px solid #e2e8f0",
                borderRadius: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                background: "#fff" }}
            />
          </div>

          {/* Filters (collapsible) */}
          {showFilters && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                {["All", ...CATEGORIES].map(c => (
                  <button key={c} onClick={() => setFilterCat(c)}
                    style={{
                      padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 20, border: "none",
                      cursor: "pointer",
                      background: filterCat === c ? "#1a3a5c" : "#e2e8f0",
                      color: filterCat === c ? "#fff" : "#475569",
                    }}>
                    {c}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["all", "All"], ["downloaded", "Downloaded"], ["not-downloaded", "Not Downloaded"]].map(([v, l]) => (
                  <button key={v} onClick={() => setFilterStatus(v)}
                    style={{
                      padding: "5px 10px", fontSize: 11, fontWeight: 600, borderRadius: 20, border: "none",
                      cursor: "pointer",
                      background: filterStatus === v ? "#e87722" : "#e2e8f0",
                      color: filterStatus === v ? "#fff" : "#475569",
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Connection toggle (for demo) */}
        <div style={{ padding: "8px 16px" }}>
          <button onClick={() => { setIsOnline(!isOnline); toast(isOnline ? "Offline mode — showing downloaded topics" : "Back online", isOnline ? "warn" : "success"); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
              background: isOnline ? "#dcfce7" : "#fef3c7", border: "none", borderRadius: 12,
              cursor: "pointer", marginBottom: 8, fontSize: 13, fontWeight: 600,
              color: isOnline ? "#166534" : "#92400e" }}>
            {isOnline ? <Check size={16} /> : <WifiOff size={16} />}
            {isOnline ? "Online — All topics accessible" : "Offline — Downloaded topics only"}
            <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.7 }}>(tap to toggle demo)</span>
          </button>
        </div>

        {/* Topic count */}
        <div style={{ padding: "4px 20px 8px", fontSize: 12, color: "#64748b" }}>
          {displayTopics.length} of 52 topics{!isOnline && " (offline — downloaded only)"}
        </div>

        {/* Topic list */}
        <div style={{ padding: "0 16px 24px" }}>
          {displayTopics.map((topic) => {
            const isDL = downloaded[topic.id];
            const isPres = presented[topic.id];
            const cc = CAT_COLORS[topic.category] || { bg: "#f1f5f9", dot: "#94a3b8" };
            const hasMeeting = meetings[topic.id];

            return (
              <div key={topic.id}
                style={{
                  background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10,
                  border: `2px solid ${isPres ? "#bbf7d0" : isDL ? "#bfdbfe" : "#e2e8f0"}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onClick={() => { setSelectedTopic(topic); setScreen("view"); }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  {/* Week badge */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: isPres ? "#dcfce7" : isDL ? "#dbeafe" : "#f1f5f9",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", lineHeight: 1 }}>WK</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: isPres ? "#166534" : isDL ? "#1e40af" : "#94a3b8", lineHeight: 1.1 }}>
                      {topic.week}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                      <CatBadge cat={topic.category} />
                      <StatusPill downloaded={isDL} presented={isPres} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", lineHeight: 1.3 }}>
                      {topic.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{topic.oshaRefs.join(" | ")}</div>
                    {hasMeeting && (
                      <div style={{ fontSize: 11, color: "#166534", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                        <Users size={12} color="#166534" />
                        {hasMeeting.signatures.length} signed · {hasMeeting.date}
                      </div>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 6,
                    background: isPres ? "#22c55e" : isDL ? "#3b82f6" : "#d1d5db",
                  }} />
                </div>
              </div>
            );
          })}

          {displayTopics.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
              <WifiOff size={40} color="#cbd5e1" />
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>
                {!isOnline ? "No downloaded topics available offline" : "No topics match your filters"}
              </div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                {!isOnline ? "Connect to WiFi to browse and download topics" : "Try adjusting your search or filters"}
              </div>
            </div>
          )}
        </div>

        {showToast && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 999,
            background: showToast.type === "success" ? "#166534" : "#dc2626", color: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
            {showToast.msg}
          </div>
        )}
      </div>
    );
  }

  // VIEW TOPIC SCREEN
  if (screen === "view" && selectedTopic) {
    const t = selectedTopic;
    const isDL = downloaded[t.id];
    const isPres = presented[t.id];
    const cc = CAT_COLORS[t.category] || { bg: "#f1f5f9", text: "#475569" };
    const existingMeeting = meetings[t.id];

    return (
      <div style={{ background: "#f8fafc", fontFamily: "'Inter','SF Pro Display',-apple-system,sans-serif", minHeight: "100vh" }}>
        <TopBar title={`Week ${t.week}`} onBack={() => setScreen("topics")} />

        <div style={{ padding: "20px 16px" }}>
          <CatBadge cat={t.category} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a3a5c", marginTop: 10, marginBottom: 4, lineHeight: 1.2 }}>
            {t.title}
          </h2>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>OSHA: {t.oshaRefs.join(" | ")}</div>

          {/* Summary */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3a5c", marginBottom: 6 }}>Topic Overview</div>
            <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{t.overview}</div>
          </div>

          {/* Status info */}
          {(isPres || existingMeeting) && (
            <div style={{ background: "#dcfce7", borderRadius: 14, padding: 14, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 10 }}>
              <Check size={20} color="#166534" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>
                  Presented on {isPres?.date || existingMeeting?.date}
                </div>
                <div style={{ fontSize: 12, color: "#166534" }}>
                  {existingMeeting ? `${existingMeeting.signatures.length} signatures collected` : "On this project"}
                </div>
              </div>
              {existingMeeting && (
                <button onClick={() => { setActiveMeeting({ topicId: t.id, ...existingMeeting }); setScreen("saved"); }}
                  style={{ marginLeft: "auto", padding: "6px 12px", fontSize: 12, fontWeight: 600,
                    background: "#166534", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
                  View
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!isDL && (
              <button onClick={() => {
                if (!isOnline) { toast("No internet connection — cannot download", "error"); return; }
                setDownloaded(d => ({ ...d, [t.id]: true }));
                toast("Topic downloaded for offline use");
              }}
                style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, border: "none",
                  borderRadius: 14, background: "#1a3a5c", color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Download size={18} /> Download for Offline
              </button>
            )}

            <button onClick={() => {
              if (!isDL && !isOnline) { toast("Download this topic first while online", "error"); return; }
              if (!isDL) setDownloaded(d => ({ ...d, [t.id]: true }));
              const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              setActiveMeeting({ topicId: t.id, date: today, project: currentProject, signatures: existingMeeting?.signatures || [] });
              setScreen("present");
            }}
              style={{
                width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, border: "none",
                borderRadius: 14, cursor: "pointer",
                background: "linear-gradient(135deg, #e87722, #d4650f)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(232,119,34,0.3)",
              }}>
              <Edit3 size={18} />
              {existingMeeting ? "Continue Meeting / Add Signatures" : "Download & Present"}
            </button>
          </div>
        </div>

        {showToast && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 999,
            background: showToast.type === "success" ? "#166534" : "#dc2626", color: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
            {showToast.msg}
          </div>
        )}
      </div>
    );
  }

  // PRESENT SCREEN - Full lesson delivery
  if (screen === "present" && selectedTopic) {
    const t = selectedTopic;
    return (
      <div style={{ background: "#f8fafc", fontFamily: "'Inter','SF Pro Display',-apple-system,sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <TopBar title={`Week ${t.week}: ${t.title}`} onBack={() => setScreen("view")} />

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px" }}>
          {/* Header section */}
          <div style={{ background: "#1a3a5c", color: "#fff", borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9, marginBottom: 4 }}>WEEK {t.week} OF 52</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{t.title}</div>
            <CatBadge cat={t.category} />
            <div style={{ fontSize: 11, marginTop: 10, opacity: 0.85, fontStyle: "italic" }}>
              OSHA: {t.oshaRefs.join(" | ")}
            </div>
          </div>

          {/* Overview section */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a3a5c", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Overview
            </div>
            <div style={{ fontSize: 15, color: "#334155", lineHeight: 1.7, background: "#fff", padding: 14, borderRadius: 10, border: "1px solid #e2e8f0" }}>
              {t.overview}
            </div>
          </div>

          {/* Key Safety Points */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a3a5c", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Key Safety Points
            </div>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {t.keyPoints.map((point, idx) => (
                <div key={idx} style={{ padding: "14px 16px", borderBottom: idx < t.keyPoints.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ color: "#e87722", fontWeight: 800, marginTop: 2, flexShrink: 0 }}>{idx + 1}.</div>
                    <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{point}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discussion Questions */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#1a3a5c", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Discussion Questions
            </div>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {t.discussionQuestions.map((q, idx) => (
                <div key={idx} style={{ padding: "14px 16px", borderBottom: idx < t.discussionQuestions.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                  <div style={{ fontSize: 14, color: "#1a3a5c", lineHeight: 1.6, fontStyle: "italic" }}>
                    <span style={{ fontWeight: 700, marginRight: 6 }}>{idx + 1}.</span>
                    {q}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remember callout */}
          <div style={{ background: "#fff3e0", borderRadius: 10, border: "3px solid #e87722", padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#e87722", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
              Remember
            </div>
            <div style={{ fontSize: 15, color: "#1a3a5c", fontWeight: 600, lineHeight: 1.6 }}>
              {t.remember}
            </div>
          </div>
        </div>

        {/* Fixed bottom button bar */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "linear-gradient(180deg, rgba(248,250,252,0.5) 0%, #f8fafc 100%)", borderTop: "1px solid #e2e8f0", padding: "12px 16px 20px", boxSizing: "border-box" }}>
          <button onClick={() => {
            const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            setActiveMeeting({ topicId: t.id, date: today, project: currentProject, signatures: meetings[t.id]?.signatures || [] });
            setScreen("meeting");
          }}
            style={{
              width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, border: "none",
              borderRadius: 12, cursor: "pointer",
              background: "linear-gradient(135deg, #e87722, #d4650f)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(232,119,34,0.3)",
            }}>
            <Users size={18} />
            Collect Signatures
          </button>
        </div>
      </div>
    );
  }

  // MEETING / SIGNATURE COLLECTION SCREEN
  if (screen === "meeting" && activeMeeting) {
    const topic = TOPICS.find(t => t.id === activeMeeting.topicId);
    const sigs = activeMeeting.signatures || [];

    const handleSaveSig = (sig) => {
      const updated = { ...activeMeeting, signatures: [...sigs, sig] };
      setActiveMeeting(updated);
      setShowSigPad(false);
      toast(`${sig.name}'s signature saved`);
    };

    const handleRemoveSig = (idx) => {
      const updated = { ...activeMeeting, signatures: sigs.filter((_, i) => i !== idx) };
      setActiveMeeting(updated);
    };

    const handleSaveMeeting = () => {
      setMeetings(m => ({ ...m, [activeMeeting.topicId]: {
        date: activeMeeting.date, project: activeMeeting.project, signatures: activeMeeting.signatures
      }}));
      setPresented(p => ({ ...p, [activeMeeting.topicId]: { date: activeMeeting.date, project: activeMeeting.project } }));
      // Persist to parent state for Supabase sync
      dispatch({
        type: "ADD_SAFETY_MEETING",
        data: {
          topicId: activeMeeting.topicId,
          date: activeMeeting.date,
          attendeeCount: activeMeeting.signatures.length
        }
      });
      toast(`Meeting saved with ${activeMeeting.signatures.length} signatures`);
      setScreen("topics");
    };

    return (
      <div style={{ background: "#f8fafc", fontFamily: "'Inter','SF Pro Display',-apple-system,sans-serif", minHeight: "100vh" }}>
        <TopBar title="Collect Signatures"
          onBack={() => {
            if (sigs.length > 0) {
              setMeetings(m => ({ ...m, [activeMeeting.topicId]: {
                date: activeMeeting.date, project: activeMeeting.project, signatures: activeMeeting.signatures
              }}));
              setPresented(p => ({ ...p, [activeMeeting.topicId]: { date: activeMeeting.date, project: activeMeeting.project } }));
              toast("Meeting auto-saved");
            }
            setScreen("view");
          }}
        />

        <div style={{ padding: "16px" }}>
          {/* Meeting info card */}
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e87722" }}>Week {topic?.week}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a3a5c", marginTop: 2 }}>{topic?.title}</div>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                <Clock size={14} /> {activeMeeting.date}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                <Users size={14} /> {sigs.length} signed
              </div>
            </div>
          </div>

          {/* Signatures list */}
          {sigs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3a5c", marginBottom: 8 }}>
                Signatures ({sigs.length})
              </div>
              {sigs.map((sig, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  background: "#fff", borderRadius: 12, marginBottom: 6, border: "1px solid #e2e8f0",
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dbeafe",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#1e40af" }}>
                    {sig.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{sig.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{sig.time} · {activeMeeting.date}</div>
                  </div>
                  <img src={sig.signature} alt="sig" style={{ width: 60, height: 30, objectFit: "contain", opacity: 0.8 }} />
                  <button onClick={() => handleRemoveSig(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Signature pad or add button */}
          {showSigPad ? (
            <SignaturePad onSave={handleSaveSig} onCancel={() => setShowSigPad(false)} />
          ) : (
            <button onClick={() => setShowSigPad(true)}
              style={{
                width: "100%", padding: "16px", fontSize: 15, fontWeight: 700, border: "2px dashed #cbd5e1",
                borderRadius: 14, background: "#fff", color: "#1a3a5c", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16,
              }}>
              <Plus size={20} />
              {sigs.length === 0 ? "Add First Signature" : "Add Another Signature"}
            </button>
          )}

          {/* Save meeting button */}
          {sigs.length > 0 && !showSigPad && (
            <button onClick={handleSaveMeeting}
              style={{
                width: "100%", padding: "16px", fontSize: 16, fontWeight: 700, border: "none",
                borderRadius: 14, background: "#166534", color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 16px rgba(22,101,52,0.3)",
              }}>
              <Save size={20} />
              Save Meeting ({sigs.length} signature{sigs.length !== 1 ? "s" : ""})
            </button>
          )}
        </div>

        {showToast && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 999,
            background: "#166534", color: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}>
            {showToast.msg}
          </div>
        )}
      </div>
    );
  }

  // SAVED MEETING VIEW SCREEN
  if (screen === "saved" && activeMeeting) {
    const topic = TOPICS.find(t => t.id === activeMeeting.topicId);
    return (
      <div style={{ background: "#f8fafc", fontFamily: "'Inter','SF Pro Display',-apple-system,sans-serif", minHeight: "100vh" }}>
        <TopBar title="Meeting Record" onBack={() => setScreen("topics")} />

        <div style={{ padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dcfce7",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={22} color="#166534" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#e87722" }}>Week {topic?.week} · {topic?.category}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a3a5c" }}>{topic?.title}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>DATE</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{activeMeeting.date}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>SIGNATURES</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{activeMeeting.signatures?.length || 0}</div>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px", gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>PROJECT</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{activeMeeting.project}</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3a5c", marginBottom: 8 }}>
            Attendees ({activeMeeting.signatures?.length || 0})
          </div>
          {activeMeeting.signatures?.map((sig, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              background: "#fff", borderRadius: 12, marginBottom: 6, border: "1px solid #e2e8f0",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#dbeafe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: "#1e40af" }}>
                {sig.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{sig.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Signed at {sig.time}</div>
              </div>
              <img src={sig.signature} alt="sig" style={{ width: 70, height: 35, objectFit: "contain" }} />
            </div>
          ))}

          {/* Add more signatures */}
          <button onClick={() => {
            setActiveMeeting({ topicId: activeMeeting.topicId, ...meetings[activeMeeting.topicId] });
            setSelectedTopic(TOPICS.find(t => t.id === activeMeeting.topicId));
            setScreen("present");
          }}
            style={{
              width: "100%", padding: "14px", fontSize: 15, fontWeight: 700,
              border: "2px solid #e87722", borderRadius: 14, background: "#fff",
              color: "#e87722", cursor: "pointer", marginTop: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            <Plus size={18} /> Add More Signatures
          </button>
        </div>
      </div>
    );
  }

  return null;
}
