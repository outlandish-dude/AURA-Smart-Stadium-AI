const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const actionTemplates = {
  medical: {
    causes: [
      "Heat-related illness exacerbated by high ambient temperature and crowd density",
      "Physical injury sustained during crowd movement in congested zone",
      "Cardiac event triggered by exertion and environmental stress",
      "Allergic reaction to food consumed at concession stand",
      "Dehydration compounded by inadequate water station access"
    ],
    factors: [
      "Ambient temperature above comfort threshold",
      "Crowd density limiting airflow and movement",
      "Distance from nearest medical station",
      "Limited shade coverage in affected area",
      "High humidity reducing body cooling efficiency"
    ],
    actions: [
      { action: "Deploy nearest medical response team to incident location", assignee: "Medical Team Lead", priority: "critical", eta_minutes: 2 },
      { action: "Clear 10-meter radius around affected person for medical access", assignee: "Section Steward", priority: "critical", eta_minutes: 1 },
      { action: "Prepare medical transport route to on-site medical bay", assignee: "Operations Coordinator", priority: "high", eta_minutes: 3 },
      { action: "Alert on-site paramedics and standby ambulance crew", assignee: "Emergency Services Liaison", priority: "high", eta_minutes: 2 },
      { action: "Set up hydration station near incident zone", assignee: "Volunteer Team Alpha", priority: "medium", eta_minutes: 8 },
      { action: "Monitor surrounding crowd for additional heat-related symptoms", assignee: "Roaming Medical Staff", priority: "medium", eta_minutes: 5 }
    ],
    volunteers: [
      { team: "Medical Volunteers Alpha", role: "First Responders", instructions: "Proceed to the incident location immediately. Bring portable medical kit and AED. Establish a perimeter and begin initial assessment. Do not move the patient unless directed by a paramedic.", zone: "Incident Zone" },
      { team: "Steward Team Bravo", role: "Crowd Management", instructions: "Create a clear corridor from the incident location to the nearest medical bay. Use barriers and verbal guidance. Keep spectators calm and redirect foot traffic away from the area.", zone: "Adjacent Concourse" },
      { team: "Hydration Team", role: "Prevention Support", instructions: "Set up an emergency water distribution point within 50 meters of the incident zone. Monitor nearby fans for signs of heat distress. Report any additional cases immediately.", zone: "Surrounding Area" },
      { team: "Communications Team", role: "Information Relay", instructions: "Maintain radio contact with Medical Team Lead. Relay patient status updates to Operations Center every 3 minutes. Coordinate with PA team if public announcement is needed.", zone: "Operations Center" }
    ],
    announcement: "Attention please. Our medical team is currently assisting a guest in {location}. For your comfort and safety, please keep the area around {location} clear. If you are feeling unwell, please visit any first aid station or ask the nearest steward for assistance. Water stations are available throughout the concourse. Thank you for your cooperation.",
    recovery: {
      immediate: [
        "Confirm patient is stable or transferred to advanced care",
        "Reopen affected area once medical team clears the scene",
        "Document incident details for medical report",
        "Restock medical supplies used during response"
      ],
      short_term: [
        "Deploy additional hydration stations in high-density zones",
        "Increase medical patrol frequency in surrounding sections",
        "Review HVAC and misting system performance in affected area",
        "Brief volunteer teams on signs of heat-related illness"
      ],
      long_term: [
        "Review medical response time against SLA targets",
        "Evaluate placement of medical stations relative to crowd density",
        "Update incident response protocol based on lessons learned",
        "Coordinate with venue management for improved shade coverage"
      ]
    }
  },
  fire: {
    causes: [
      "Electrical fault in concession equipment causing ignition",
      "Overloaded circuit in temporary infrastructure wiring",
      "Cooking equipment malfunction at food service area",
      "Discarded smoking material igniting combustible waste",
      "HVAC system overheating due to sustained high-load operation"
    ],
    factors: [
      "Proximity to combustible materials and food packaging",
      "Ventilation system potentially spreading smoke",
      "High crowd density complicating evacuation routes",
      "Delayed detection due to ambient noise masking alarms",
      "Limited fire suppression equipment in temporary structures"
    ],
    actions: [
      { action: "Activate fire suppression system in affected zone", assignee: "Fire Safety Officer", priority: "critical", eta_minutes: 1 },
      { action: "Initiate partial evacuation of affected section and adjacent areas", assignee: "Evacuation Coordinator", priority: "critical", eta_minutes: 2 },
      { action: "Alert municipal fire department and confirm response ETA", assignee: "Emergency Services Liaison", priority: "critical", eta_minutes: 1 },
      { action: "Shut down HVAC in affected zone to prevent smoke spread", assignee: "Building Systems Engineer", priority: "critical", eta_minutes: 3 },
      { action: "Deploy fire wardens with extinguishers to contain spread", assignee: "Fire Warden Team", priority: "high", eta_minutes: 2 },
      { action: "Open all emergency exits in affected quadrant", assignee: "Gate Operations", priority: "high", eta_minutes: 2 },
      { action: "Redirect crowd flow away from smoke-affected concourse", assignee: "Crowd Management Lead", priority: "high", eta_minutes: 4 }
    ],
    volunteers: [
      { team: "Fire Warden Team", role: "Containment", instructions: "Proceed to the fire location with portable extinguishers. Attempt containment ONLY if safe to do so. If fire exceeds initial stage, evacuate immediately and report. Never block evacuation routes.", zone: "Incident Zone" },
      { team: "Evacuation Team Alpha", role: "Evacuation Leaders", instructions: "Guide all spectators in the affected section toward the nearest emergency exits. Use calm, assertive voice commands. Assist mobility-impaired guests first. Do not allow re-entry until all-clear is issued.", zone: "Affected Section" },
      { team: "Steward Team Charlie", role: "Perimeter Control", instructions: "Establish a 50-meter safety perimeter around the incident zone. Prevent unauthorized access. Direct emergency vehicles to the staging area. Keep all evacuation corridors clear.", zone: "Perimeter" },
      { team: "First Aid Team", role: "Medical Standby", instructions: "Position at evacuation assembly points. Prepare for smoke inhalation cases. Have oxygen equipment ready. Triage any injuries and coordinate with ambulance crews.", zone: "Assembly Points" }
    ],
    announcement: "Attention all guests. As a precautionary measure, we are asking guests in {location} to calmly proceed to the nearest exit. Please follow the directions of our stewards. Do not use elevators. If you need assistance, our stewards will help you. All other areas of the venue remain safe. Thank you for your cooperation.",
    recovery: {
      immediate: [
        "Confirm fire is fully extinguished and scene is safe",
        "Ventilate affected area and test air quality",
        "Conduct headcount at assembly points",
        "Assess structural integrity of affected zone"
      ],
      short_term: [
        "Allow controlled re-entry once fire marshal gives all-clear",
        "Inspect all electrical systems in adjacent areas",
        "Deploy additional fire safety patrols venue-wide",
        "Provide water and comfort support at assembly points"
      ],
      long_term: [
        "Commission full electrical inspection of affected infrastructure",
        "Review fire detection and suppression response times",
        "Update evacuation plans based on incident findings",
        "Brief all staff on revised fire safety protocols"
      ]
    }
  },
  power_failure: {
    causes: [
      "Primary power grid failure affecting stadium feed",
      "Transformer overload due to sustained peak demand",
      "Generator switchover failure during utility interruption",
      "Distribution panel fault isolating affected zone",
      "Lightning strike damaging external power infrastructure"
    ],
    factors: [
      "Peak electrical demand from HVAC, lighting, and AV systems",
      "Backup generator warm-up time creating gap in coverage",
      "Cascading load on remaining circuits increasing failure risk",
      "Security and communication systems on shared power circuits",
      "Emergency lighting battery age and charge state"
    ],
    actions: [
      { action: "Activate backup generator systems for critical infrastructure", assignee: "Chief Electrician", priority: "critical", eta_minutes: 1 },
      { action: "Confirm emergency lighting is operational in all zones", assignee: "Facilities Manager", priority: "critical", eta_minutes: 2 },
      { action: "Verify security camera and access control systems are on backup power", assignee: "Security Operations", priority: "critical", eta_minutes: 2 },
      { action: "Notify PA system team to switch to battery backup mode", assignee: "Communications Lead", priority: "high", eta_minutes: 1 },
      { action: "Deploy stewards with flashlights to darkened areas", assignee: "Steward Coordinator", priority: "high", eta_minutes: 3 },
      { action: "Contact utility provider for restoration timeline", assignee: "Facilities Manager", priority: "high", eta_minutes: 5 }
    ],
    volunteers: [
      { team: "Steward Team Delta", role: "Guest Assistance", instructions: "Deploy to darkened areas with flashlights and glow sticks. Calm guests and provide directions. Assist any guests with mobility needs. Report any safety hazards caused by the power loss.", zone: "Affected Areas" },
      { team: "Security Patrol", role: "Safety Monitoring", instructions: "Increase patrol frequency in all darkened zones. Monitor for unauthorized access attempts. Ensure emergency exits remain illuminated and accessible. Report any crowd anxiety or movement issues.", zone: "Venue-wide" },
      { team: "Communications Team", role: "Information Distribution", instructions: "Use megaphones and handheld radios to keep guests informed. Provide estimated restoration times when available. Direct guests to illuminated concourse areas. Reassure guests that backup systems are active.", zone: "All Concourses" },
      { team: "Technical Support", role: "System Recovery", instructions: "Assist electrical team with circuit testing and restoration. Monitor generator fuel levels and performance. Document affected systems for post-incident review. Prioritize restoration of safety-critical systems.", zone: "Electrical Infrastructure" }
    ],
    announcement: "Attention guests. We are currently experiencing a temporary power interruption in {location}. Emergency lighting and safety systems are fully operational. Our technical team is working to restore full power shortly. For your comfort, please remain in your seats or proceed to any illuminated concourse area. Stewards are available to assist you. Thank you for your patience.",
    recovery: {
      immediate: [
        "Restore power to safety-critical systems first",
        "Verify all emergency exits and lighting are functional",
        "Check refrigeration systems at food service areas",
        "Confirm communication systems are fully operational"
      ],
      short_term: [
        "Gradually restore non-essential systems to avoid surge",
        "Inspect electrical panels for damage or overheating",
        "Resume normal HVAC operations and verify comfort levels",
        "Test all AV and display systems before resuming use"
      ],
      long_term: [
        "Commission full electrical audit of affected circuits",
        "Review backup power switchover procedures",
        "Evaluate generator capacity against peak load requirements",
        "Update power redundancy plan for critical infrastructure"
      ]
    }
  },
  security: {
    causes: [
      "Unauthorized individual bypassed perimeter security checkpoint",
      "Physical altercation between spectators escalated",
      "Suspicious unattended package discovered in public area",
      "Credential forgery detected at VIP access point",
      "Coordinated ticket fraud or mass unauthorized entry attempt"
    ],
    factors: [
      "High crowd density reducing visibility for security teams",
      "Multiple entry points creating distributed security surface",
      "Event significance increasing attractiveness as target",
      "Limited CCTV coverage in certain concourse segments",
      "Communication delays between security zones"
    ],
    actions: [
      { action: "Lock down affected zone and establish security perimeter", assignee: "Security Team Lead", priority: "critical", eta_minutes: 1 },
      { action: "Deploy rapid response team to incident location", assignee: "Security Rapid Response", priority: "critical", eta_minutes: 2 },
      { action: "Alert law enforcement liaison for potential support", assignee: "Police Liaison Officer", priority: "high", eta_minutes: 1 },
      { action: "Review CCTV footage of incident zone for last 30 minutes", assignee: "Surveillance Operator", priority: "high", eta_minutes: 3 },
      { action: "Increase security presence at all entry and exit points", assignee: "Gate Security Supervisor", priority: "high", eta_minutes: 5 },
      { action: "Sweep adjacent areas for related threats", assignee: "Security Patrol Units", priority: "medium", eta_minutes: 8 }
    ],
    volunteers: [
      { team: "Security Volunteer Team", role: "Perimeter Support", instructions: "Assist security staff in maintaining the safety perimeter. Do NOT attempt to engage with any threat directly. Report all observations to the Security Team Lead immediately. Monitor crowd behavior for signs of panic.", zone: "Perimeter" },
      { team: "Steward Team Echo", role: "Crowd Redirection", instructions: "Calmly redirect foot traffic away from the secured area. Use alternative route signage. Answer guest questions with approved information only: 'A security check is in progress, and the area will reopen shortly.' Do not speculate.", zone: "Adjacent Areas" },
      { team: "Guest Relations", role: "Comfort Support", instructions: "Position at information points near the affected area. Provide reassurance to concerned guests. Direct guests seeking refunds or exits to appropriate service points. Document guest complaints.", zone: "Information Desks" },
      { team: "Communications Relay", role: "Coordination", instructions: "Maintain continuous radio contact between security teams, operations center, and volunteer leads. Log all communications with timestamps. Escalate any new observations immediately.", zone: "Operations Center" }
    ],
    announcement: "Attention guests. A routine security check is currently in progress near {location}. For your safety, please avoid the immediate area and follow the directions of our security team and stewards. All other areas of the venue are open and operating normally. We appreciate your patience and understanding.",
    recovery: {
      immediate: [
        "Confirm threat is neutralized or area is cleared",
        "Debrief security teams and document findings",
        "Review and preserve CCTV footage for investigation",
        "Restore normal access once security gives all-clear"
      ],
      short_term: [
        "Increase security patrol frequency venue-wide",
        "Brief all gate staff on heightened awareness posture",
        "Coordinate with law enforcement for extended presence",
        "Review and reinforce credential verification procedures"
      ],
      long_term: [
        "Conduct full security audit of entry and exit points",
        "Review CCTV coverage gaps identified during incident",
        "Update security response protocols and training",
        "Evaluate technology upgrades for threat detection"
      ]
    }
  },
  lost_child: {
    causes: [
      "Child separated from guardian in high-density crowd movement",
      "Guardian-child separation during concession or restroom visit",
      "Child wandered from seating area during match activities",
      "Separation during entry congestion at gate bottleneck",
      "Guardian medical incident leaving child unaccompanied"
    ],
    factors: [
      "High crowd density making visual tracking difficult",
      "Noise levels preventing verbal communication",
      "Multiple levels and corridors creating disorientation",
      "Child's height below adult sightlines in standing crowd",
      "Language barriers between child and nearby adults"
    ],
    actions: [
      { action: "Activate lost child protocol — assign case ID and coordinator", assignee: "Child Safety Coordinator", priority: "critical", eta_minutes: 1 },
      { action: "Broadcast PA announcement with approved child description", assignee: "PA System Operator", priority: "critical", eta_minutes: 2 },
      { action: "Deploy search teams to last known location and surrounding zones", assignee: "Security Search Team", priority: "critical", eta_minutes: 2 },
      { action: "Check all child assembly points and family service areas", assignee: "Family Services Team", priority: "high", eta_minutes: 3 },
      { action: "Alert all gate staff to monitor exits for matching description", assignee: "Gate Operations Manager", priority: "critical", eta_minutes: 2 },
      { action: "Review CCTV from last known location timestamp", assignee: "Surveillance Operator", priority: "high", eta_minutes: 4 }
    ],
    volunteers: [
      { team: "Child Safety Volunteers", role: "Search Team", instructions: "Form pairs and search assigned zones systematically. Approach any unaccompanied children gently — kneel to their level. Ask their name and if they know where their parent is. Stay with any found child and radio immediately. NEVER move a child alone.", zone: "Search Grid" },
      { team: "Gate Monitor Team", role: "Exit Watch", instructions: "Station at all venue exits. Check every child leaving against the broadcast description. If a match is found, politely ask the adult to verify guardianship at the family service desk. Do not physically detain anyone.", zone: "All Exits" },
      { team: "Family Services", role: "Reunification Support", instructions: "Prepare the family reunification area. Have comfort items available (water, blankets). When the child is located, verify guardian identity before handover. Document the reunification with guardian ID and signatures.", zone: "Family Service Center" },
      { team: "Multilingual Volunteers", role: "Communication Support", instructions: "Position at key search areas to assist with language barriers. Help translate descriptions for non-English-speaking guests. Support guardians who may have difficulty communicating the situation.", zone: "Concourse Hubs" }
    ],
    announcement: "Attention guests. We are assisting a family in locating a young child. If you see an unaccompanied child or if your child has become separated from you, please contact the nearest steward or visit any family service point. Our team is actively assisting, and we kindly ask for your awareness and cooperation. Thank you.",
    recovery: {
      immediate: [
        "Confirm child is safely reunited with verified guardian",
        "Complete reunification documentation and incident report",
        "Stand down search teams and close protocol",
        "Debrief all involved teams"
      ],
      short_term: [
        "Offer family support services and complimentary refreshments",
        "Review incident for protocol improvement opportunities",
        "Reinforce wristband and family identification programs",
        "Brief stewards on areas with highest separation risk"
      ],
      long_term: [
        "Evaluate child tracking wristband technology for future events",
        "Improve family service point visibility and signage",
        "Review crowd management at high-separation-risk areas",
        "Update training materials for lost child protocol"
      ]
    }
  },
  crowd_surge: {
    causes: [
      "Sudden crowd movement triggered by goal celebration or reaction",
      "Bottleneck at concourse junction creating compression wave",
      "Gate failure or closure forcing crowd redirection",
      "Panic-driven movement from perceived threat or incident",
      "Mass exit attempt during sudden weather change"
    ],
    factors: [
      "Crowd density exceeding safe threshold in affected zone",
      "Limited exit capacity relative to crowd volume",
      "Sloped or uneven surfaces increasing fall risk",
      "Barriers or fencing preventing natural crowd dispersion",
      "Communication delay in relaying crowd conditions to operators"
    ],
    actions: [
      { action: "Open all emergency gates in surge-affected zone immediately", assignee: "Gate Operations Manager", priority: "critical", eta_minutes: 1 },
      { action: "Deploy crowd management teams to relieve pressure points", assignee: "Crowd Safety Lead", priority: "critical", eta_minutes: 1 },
      { action: "Halt all new ingress at gates feeding the affected area", assignee: "Gate Operations", priority: "critical", eta_minutes: 1 },
      { action: "Alert medical teams — position at surge edges for crush injuries", assignee: "Medical Team Lead", priority: "critical", eta_minutes: 2 },
      { action: "Activate PA system with crowd calming message", assignee: "PA System Operator", priority: "critical", eta_minutes: 1 },
      { action: "Remove any temporary barriers that may be compressing crowd", assignee: "Facilities Response Team", priority: "high", eta_minutes: 3 },
      { action: "Monitor CCTV for secondary surge points", assignee: "Surveillance Operator", priority: "high", eta_minutes: 2 }
    ],
    volunteers: [
      { team: "Crowd Safety Team", role: "Pressure Relief", instructions: "Position at the edges of the surge. Use approved hand signals and calm verbal commands to slow movement. Create space by opening side routes. NEVER push against the crowd flow. If you feel unsafe, step aside immediately.", zone: "Surge Zone" },
      { team: "Medical Standby Team", role: "Triage", instructions: "Position at surge edges and evacuation points. Prepare for crush, trampling, and panic-related injuries. Prioritize airway and breathing issues. Set up triage area at nearest clear space.", zone: "Surge Perimeter" },
      { team: "Barrier Management", role: "Infrastructure", instructions: "Immediately remove or open any temporary barriers, gates, or fencing that are creating compression points. Work from the outside in. Coordinate with facilities team before moving permanent structures.", zone: "Affected Zone" },
      { team: "Evacuation Support", role: "Safe Exit Guidance", instructions: "Guide guests toward open emergency exits using clear, calm directions. Prioritize vulnerable individuals — children, elderly, wheelchair users. Maintain orderly flow. Do not allow counter-flow.", zone: "Exit Routes" }
    ],
    announcement: "Attention all guests. For everyone's safety, please stop moving forward and take one step back if you can. Our team is opening additional exits now. Please remain calm and follow the directions of our stewards. If you need assistance, raise your hand. We are here to help you. Please do not push or run.",
    recovery: {
      immediate: [
        "Confirm crowd pressure is relieved and density is below safe threshold",
        "Conduct medical sweep of surge area for injured persons",
        "Count and assist any individuals who fell or were trapped",
        "Restore controlled flow patterns"
      ],
      short_term: [
        "Keep additional exit routes open until crowd density normalizes",
        "Deploy extra medical patrols in and around the surge zone",
        "Monitor for secondary surge events in connected areas",
        "Provide water and rest areas for distressed guests"
      ],
      long_term: [
        "Review crowd density monitoring and alert thresholds",
        "Evaluate physical infrastructure for crowd flow improvements",
        "Update crowd management training and surge protocols",
        "Assess technology for real-time density monitoring and prediction"
      ]
    }
  },
  weather: {
    causes: [
      "Severe thunderstorm with lightning risk to open-air venue",
      "Extreme heat advisory with temperatures exceeding safe limits",
      "High wind conditions affecting temporary structures and signage",
      "Heavy rainfall creating flooding and slip hazards",
      "Tornado warning issued for venue area"
    ],
    factors: [
      "Open-air venue exposing guests to weather elements",
      "Temporary structures vulnerable to wind damage",
      "Electrical systems at risk from lightning and water",
      "Limited indoor shelter capacity relative to attendance",
      "Transportation disruption affecting post-event egress"
    ],
    actions: [
      { action: "Activate weather emergency protocol for the venue", assignee: "Safety Director", priority: "critical", eta_minutes: 1 },
      { action: "Initiate phased movement of guests to covered shelter areas", assignee: "Evacuation Coordinator", priority: "critical", eta_minutes: 2 },
      { action: "Secure all temporary structures, banners, and loose equipment", assignee: "Facilities Team", priority: "high", eta_minutes: 5 },
      { action: "Suspend outdoor food service and close exposed concession areas", assignee: "Concessions Manager", priority: "high", eta_minutes: 3 },
      { action: "Brief all volunteer teams on weather shelter locations", assignee: "Volunteer Coordinator", priority: "high", eta_minutes: 3 },
      { action: "Coordinate with transportation services for modified egress plan", assignee: "Transport Liaison", priority: "medium", eta_minutes: 8 }
    ],
    volunteers: [
      { team: "Weather Response Team", role: "Guest Guidance", instructions: "Direct guests to the nearest covered shelter areas. Use the shelter location maps. Prioritize guests in exposed upper deck sections. Assist families with children and elderly guests. Do NOT remain in exposed areas yourself.", zone: "Exposed Areas" },
      { team: "Facilities Volunteers", role: "Infrastructure Safety", instructions: "Secure any loose equipment, signage, or temporary structures. Move portable items to protected storage. Report any structural damage or flooding to Facilities Manager immediately. Avoid working near metal structures during lightning.", zone: "Exterior & Temporary Areas" },
      { team: "Guest Comfort Team", role: "Shelter Support", instructions: "Set up comfort stations in shelter areas with water, towels, and first aid supplies. Manage shelter capacity — redirect to alternate shelters if overcrowded. Keep guests informed with regular weather updates.", zone: "Shelter Areas" },
      { team: "Information Team", role: "Communication", instructions: "Distribute weather update information to guests. Use approved messaging only. Direct guests to official venue app for real-time updates. Assist with transportation questions and modified egress routes.", zone: "Information Points" }
    ],
    announcement: "Attention guests. Due to approaching severe weather, we are asking all guests in open areas to please move to the nearest covered concourse or shelter area. Our stewards will guide you. Please do not remain in exposed seating areas. Updates will be provided every 10 minutes. Your safety is our top priority. Thank you.",
    recovery: {
      immediate: [
        "Confirm all guests are in sheltered areas",
        "Assess any structural damage from weather",
        "Check for injuries related to weather exposure",
        "Verify electrical and safety systems are functional"
      ],
      short_term: [
        "Monitor weather radar for clearing conditions",
        "Prepare phased return-to-seats plan when safe",
        "Resume food service and guest amenities",
        "Communicate updated event schedule to guests"
      ],
      long_term: [
        "Review shelter capacity and access routes",
        "Evaluate weather monitoring and early warning systems",
        "Update weather contingency plans based on incident",
        "Assess impact on transportation and coordinate with transit"
      ]
    }
  }
};

const multilingualTemplates = {
  medical: {
    en: "Our medical team is assisting a guest in {location}. Please keep the area clear. If you feel unwell, visit any first aid station or ask a steward for help. Water stations are available throughout the venue.",
    es: "Nuestro equipo médico está atendiendo a un invitado en {location}. Por favor, mantenga el área despejada. Si se siente mal, visite cualquier puesto de primeros auxilios o pida ayuda a un asistente. Hay estaciones de agua disponibles en todo el recinto.",
    fr: "Notre équipe médicale assiste un spectateur à {location}. Veuillez garder la zone dégagée. Si vous ne vous sentez pas bien, rendez-vous au poste de secours le plus proche ou demandez l'aide d'un steward. Des points d'eau sont disponibles dans tout le stade.",
    ar: "يقوم فريقنا الطبي بمساعدة أحد الضيوف في {location}. يرجى إبقاء المنطقة خالية. إذا شعرت بتوعك، قم بزيارة أي محطة إسعافات أولية أو اطلب المساعدة من أحد المشرفين. محطات المياه متوفرة في جميع أنحاء المكان.",
    zh: "我们的医疗团队正在{location}协助一位来宾。请保持该区域畅通。如果您感到不适，请前往任何急救站或向工作人员求助。整个场馆内设有饮水站。",
    pt: "Nossa equipe médica está atendendo um convidado em {location}. Por favor, mantenha a área livre. Se você não estiver se sentindo bem, visite qualquer posto de primeiros socorros ou peça ajuda a um comissário. Estações de água estão disponíveis em todo o local."
  },
  fire: {
    en: "As a precaution, please calmly proceed to the nearest exit from {location}. Follow steward directions. Do not use elevators. All other venue areas remain safe.",
    es: "Como precaución, por favor diríjase con calma a la salida más cercana desde {location}. Siga las indicaciones de los asistentes. No use los ascensores. Todas las demás áreas del recinto permanecen seguras.",
    fr: "Par précaution, veuillez vous diriger calmement vers la sortie la plus proche depuis {location}. Suivez les instructions des stewards. N'utilisez pas les ascenseurs. Toutes les autres zones du stade restent sûres.",
    ar: "كإجراء احترازي، يرجى التوجه بهدوء إلى أقرب مخرج من {location}. اتبع توجيهات المشرفين. لا تستخدم المصاعد. جميع مناطق المكان الأخرى آمنة.",
    zh: "作为预防措施，请从{location}冷静地前往最近的出口。请按照工作人员的指示行动。请勿使用电梯。场馆其他区域保持安全。",
    pt: "Como precaução, por favor dirija-se calmamente à saída mais próxima de {location}. Siga as orientações dos comissários. Não use elevadores. Todas as outras áreas do local permanecem seguras."
  },
  power_failure: {
    en: "We are experiencing a temporary power interruption in {location}. Emergency systems are fully operational. Please remain calm. Our team is restoring power shortly. Stewards are available to assist.",
    es: "Estamos experimentando una interrupción temporal de energía en {location}. Los sistemas de emergencia están plenamente operativos. Mantenga la calma. Nuestro equipo está restableciendo la energía en breve. Los asistentes están disponibles para ayudar.",
    fr: "Nous connaissons une interruption temporaire de courant à {location}. Les systèmes d'urgence sont pleinement opérationnels. Restez calme. Notre équipe rétablit le courant sous peu. Les stewards sont disponibles pour vous aider.",
    ar: "نواجه انقطاعًا مؤقتًا في التيار الكهربائي في {location}. أنظمة الطوارئ تعمل بكامل طاقتها. يرجى التزام الهدوء. فريقنا يعمل على استعادة الطاقة قريبًا. المشرفون متاحون للمساعدة.",
    zh: "我们在{location}遇到了临时停电。应急系统完全正常运行。请保持冷静。我们的团队将很快恢复供电。工作人员随时为您提供帮助。",
    pt: "Estamos enfrentando uma interrupção temporária de energia em {location}. Os sistemas de emergência estão totalmente operacionais. Mantenha a calma. Nossa equipe está restaurando a energia em breve. Os comissários estão disponíveis para ajudar."
  },
  security: {
    en: "A routine security check is in progress near {location}. Please avoid the immediate area and follow security team directions. All other areas are open. We appreciate your patience.",
    es: "Se está realizando un control de seguridad de rutina cerca de {location}. Evite el área inmediata y siga las indicaciones del equipo de seguridad. Todas las demás áreas están abiertas. Agradecemos su paciencia.",
    fr: "Un contrôle de sécurité de routine est en cours près de {location}. Veuillez éviter la zone immédiate et suivre les instructions de l'équipe de sécurité. Toutes les autres zones sont ouvertes. Nous apprécions votre patience.",
    ar: "يجري فحص أمني روتيني بالقرب من {location}. يرجى تجنب المنطقة المباشرة واتباع توجيهات فريق الأمن. جميع المناطق الأخرى مفتوحة. نقدر صبركم.",
    zh: "在{location}附近正在进行例行安全检查。请避开该区域并按照安保团队的指示行动。所有其他区域正常开放。感谢您的耐心配合。",
    pt: "Uma verificação de segurança de rotina está em andamento perto de {location}. Evite a área imediata e siga as orientações da equipe de segurança. Todas as outras áreas estão abertas. Agradecemos sua paciência."
  },
  lost_child: {
    en: "We are helping a family locate a child. If you see an unaccompanied child or your child has become separated, please contact the nearest steward or visit any family service point. Thank you for your awareness.",
    es: "Estamos ayudando a una familia a localizar a un niño. Si ve a un niño no acompañado o su hijo se ha separado, contacte al asistente más cercano o visite cualquier punto de servicio familiar. Gracias por su atención.",
    fr: "Nous aidons une famille à localiser un enfant. Si vous voyez un enfant non accompagné ou si votre enfant s'est séparé de vous, contactez le steward le plus proche ou rendez-vous à un point de service familial. Merci de votre vigilance.",
    ar: "نحن نساعد عائلة في تحديد موقع طفل. إذا رأيت طفلاً غير مصحوب أو إذا انفصل طفلك عنك، يرجى الاتصال بأقرب مشرف أو زيارة أي نقطة خدمة عائلية. شكرًا لتعاونكم.",
    zh: "我们正在帮助一个家庭寻找走失的孩子。如果您看到无人陪伴的儿童，或您的孩子与您走散，请联系最近的工作人员或前往任何家庭服务点。感谢您的关注。",
    pt: "Estamos ajudando uma família a localizar uma criança. Se você vir uma criança desacompanhada ou seu filho se separou, entre em contato com o comissário mais próximo ou visite qualquer ponto de serviço familiar. Obrigado pela sua atenção."
  },
  crowd_surge: {
    en: "For everyone's safety, please stop moving forward and take one step back if possible. Additional exits are being opened. Remain calm and follow steward directions. Do not push or run. We are here to help.",
    es: "Por la seguridad de todos, deje de avanzar y dé un paso atrás si es posible. Se están abriendo salidas adicionales. Mantenga la calma y siga las indicaciones de los asistentes. No empuje ni corra. Estamos aquí para ayudar.",
    fr: "Pour la sécurité de tous, arrêtez d'avancer et reculez d'un pas si possible. Des sorties supplémentaires sont ouvertes. Restez calme et suivez les instructions des stewards. Ne poussez pas et ne courez pas. Nous sommes là pour vous aider.",
    ar: "من أجل سلامة الجميع، توقفوا عن التقدم وتراجعوا خطوة للخلف إن أمكن. يتم فتح مخارج إضافية. ابقوا هادئين واتبعوا توجيهات المشرفين. لا تدفعوا أو تركضوا. نحن هنا للمساعدة.",
    zh: "为了大家的安全，请停止前进，如果可以请后退一步。正在开放更多出口。请保持冷静，按照工作人员指示行动。请勿推挤或奔跑。我们在这里为您提供帮助。",
    pt: "Para a segurança de todos, pare de avançar e dê um passo para trás, se possível. Saídas adicionais estão sendo abertas. Mantenha a calma e siga as orientações dos comissários. Não empurre nem corra. Estamos aqui para ajudar."
  },
  weather: {
    en: "Due to severe weather, please move to the nearest covered shelter area from {location}. Follow steward directions. Do not remain in exposed seating. Updates every 10 minutes. Your safety is our priority.",
    es: "Debido al clima severo, diríjase al área de refugio cubierto más cercana desde {location}. Siga las indicaciones de los asistentes. No permanezca en asientos expuestos. Actualizaciones cada 10 minutos. Su seguridad es nuestra prioridad.",
    fr: "En raison du mauvais temps, veuillez vous rendre à l'abri couvert le plus proche depuis {location}. Suivez les instructions des stewards. Ne restez pas dans les sièges exposés. Mises à jour toutes les 10 minutes. Votre sécurité est notre priorité.",
    ar: "بسبب الطقس القاسي، يرجى الانتقال إلى أقرب منطقة مأوى مغطاة من {location}. اتبع توجيهات المشرفين. لا تبقوا في المقاعد المكشوفة. تحديثات كل 10 دقائق. سلامتكم أولويتنا.",
    zh: "由于恶劣天气，请从{location}移至最近的有遮蔽避难区。请按照工作人员指示行动。请勿留在露天座位区。每10分钟更新一次信息。您的安全是我们的首要任务。",
    pt: "Devido ao mau tempo, por favor dirija-se à área de abrigo coberto mais próxima de {location}. Siga as orientações dos comissários. Não permaneça em assentos expostos. Atualizações a cada 10 minutos. Sua segurança é nossa prioridade."
  }
};

function riskScoreForType(type, severity) {
  const baseScores = { medical: 62, fire: 88, power_failure: 55, security: 72, lost_child: 65, crowd_surge: 92, weather: 58 };
  const severityMultiplier = { critical: 1.15, high: 1.0, medium: 0.8, low: 0.6 };
  return clamp(Math.round((baseScores[type] || 60) * (severityMultiplier[severity] || 1.0)), 0, 100);
}

function buildTimeline(type, severity) {
  const baselines = {
    medical: [
      { time_offset_minutes: 0, event: "Incident detected and reported", status: "completed" },
      { time_offset_minutes: 1, event: "Medical team dispatched to location", status: "completed" },
      { time_offset_minutes: 3, event: "First responders arrive on scene", status: "in_progress" },
      { time_offset_minutes: 5, event: "Initial patient assessment completed", status: "projected" },
      { time_offset_minutes: 8, event: "Treatment administered or transport initiated", status: "projected" },
      { time_offset_minutes: 15, event: "Patient stabilized or transferred to facility", status: "projected" },
      { time_offset_minutes: 20, event: "Scene cleared and area reopened", status: "projected" },
      { time_offset_minutes: 30, event: "Post-incident report filed", status: "projected" }
    ],
    fire: [
      { time_offset_minutes: 0, event: "Fire/smoke detected — alarm triggered", status: "completed" },
      { time_offset_minutes: 1, event: "Fire suppression systems activated", status: "completed" },
      { time_offset_minutes: 2, event: "Partial evacuation initiated", status: "in_progress" },
      { time_offset_minutes: 3, event: "Fire department notified and en route", status: "in_progress" },
      { time_offset_minutes: 5, event: "Evacuation of affected section complete", status: "projected" },
      { time_offset_minutes: 10, event: "Fire department on scene", status: "projected" },
      { time_offset_minutes: 20, event: "Fire contained or extinguished", status: "projected" },
      { time_offset_minutes: 30, event: "Scene assessment and structural review", status: "projected" },
      { time_offset_minutes: 45, event: "Controlled re-entry if safe", status: "projected" }
    ],
    power_failure: [
      { time_offset_minutes: 0, event: "Power loss detected in affected zone", status: "completed" },
      { time_offset_minutes: 1, event: "Emergency lighting and backup systems engaged", status: "completed" },
      { time_offset_minutes: 2, event: "Diagnostic assessment initiated", status: "in_progress" },
      { time_offset_minutes: 5, event: "Root cause identified", status: "projected" },
      { time_offset_minutes: 10, event: "Utility provider contacted with timeline", status: "projected" },
      { time_offset_minutes: 20, event: "Partial power restoration begins", status: "projected" },
      { time_offset_minutes: 35, event: "Full power restored and systems verified", status: "projected" },
      { time_offset_minutes: 40, event: "Normal operations resumed", status: "projected" }
    ],
    security: [
      { time_offset_minutes: 0, event: "Security incident reported", status: "completed" },
      { time_offset_minutes: 1, event: "Zone lockdown and perimeter established", status: "completed" },
      { time_offset_minutes: 2, event: "Rapid response team deployed", status: "in_progress" },
      { time_offset_minutes: 5, event: "CCTV review and evidence gathering", status: "projected" },
      { time_offset_minutes: 8, event: "Threat assessment completed", status: "projected" },
      { time_offset_minutes: 15, event: "Law enforcement coordination if needed", status: "projected" },
      { time_offset_minutes: 25, event: "All-clear issued or escalation decision", status: "projected" },
      { time_offset_minutes: 30, event: "Normal access restored", status: "projected" }
    ],
    lost_child: [
      { time_offset_minutes: 0, event: "Lost child reported — protocol activated", status: "completed" },
      { time_offset_minutes: 1, event: "Case ID assigned and description broadcast", status: "completed" },
      { time_offset_minutes: 2, event: "Search teams deployed to last known area", status: "in_progress" },
      { time_offset_minutes: 3, event: "Gate monitoring activated", status: "in_progress" },
      { time_offset_minutes: 5, event: "CCTV review of last known location", status: "projected" },
      { time_offset_minutes: 10, event: "Expanded search to adjacent zones", status: "projected" },
      { time_offset_minutes: 15, event: "Child located and identity verified", status: "projected" },
      { time_offset_minutes: 20, event: "Guardian reunification completed", status: "projected" }
    ],
    crowd_surge: [
      { time_offset_minutes: 0, event: "Crowd surge detected — density critical", status: "completed" },
      { time_offset_minutes: 1, event: "Emergency exits opened — ingress halted", status: "completed" },
      { time_offset_minutes: 1, event: "PA system activated with calming message", status: "in_progress" },
      { time_offset_minutes: 2, event: "Crowd management teams at pressure points", status: "in_progress" },
      { time_offset_minutes: 5, event: "Barriers removed to allow dispersion", status: "projected" },
      { time_offset_minutes: 8, event: "Medical teams sweeping for injuries", status: "projected" },
      { time_offset_minutes: 12, event: "Density below safe threshold", status: "projected" },
      { time_offset_minutes: 20, event: "Controlled flow restored", status: "projected" }
    ],
    weather: [
      { time_offset_minutes: 0, event: "Severe weather alert received", status: "completed" },
      { time_offset_minutes: 1, event: "Weather protocol activated", status: "completed" },
      { time_offset_minutes: 3, event: "Guest movement to shelters initiated", status: "in_progress" },
      { time_offset_minutes: 5, event: "Temporary structures secured", status: "in_progress" },
      { time_offset_minutes: 10, event: "All guests in shelter areas", status: "projected" },
      { time_offset_minutes: 15, event: "Weather conditions monitored", status: "projected" },
      { time_offset_minutes: 30, event: "Weather clearing — assessment begins", status: "projected" },
      { time_offset_minutes: 40, event: "Phased return to seating if safe", status: "projected" }
    ]
  };
  return baselines[type] || baselines.medical;
}

function fillTemplate(template, location) {
  return template.replace(/\{location\}/g, location || "the affected area");
}

export function analyzeIncident(incident) {
  const type = incident.type || "medical";
  const severity = incident.severity || "high";
  const location = incident.location || "Unknown Location";
  const description = incident.description || "Incident reported without detailed description.";
  const affectedCount = incident.affected_count || 1;

  const template = actionTemplates[type] || actionTemplates.medical;
  const multilingualTemplate = multilingualTemplates[type] || multilingualTemplates.medical;

  const causeIndex = Math.floor(Math.random() * template.causes.length);
  const factorCount = severity === "critical" ? 4 : severity === "high" ? 3 : 2;

  const riskScore = riskScoreForType(type, severity);
  const likelihoodMap = { critical: "Almost Certain", high: "Likely", medium: "Possible", low: "Unlikely" };
  const impactMap = { critical: "Catastrophic", high: "Major", medium: "Moderate", low: "Minor" };

  const cascadingRisks = {
    medical: ["Secondary heat-related incidents if crowd remains stationary", "Crowd anxiety if medical response is visible from stands", "Gate congestion if ambulance access route is activated"],
    fire: ["Smoke inhalation across connected concourse areas", "Stampede risk during uncontrolled evacuation", "Structural compromise if fire spreads to load-bearing area"],
    power_failure: ["Security system gaps in darkened zones", "Crowd anxiety and movement in low-visibility areas", "Food safety risk from refrigeration loss"],
    security: ["Copy-cat incidents if perimeter is perceived as weak", "Crowd panic if security response is misinterpreted", "Delayed egress if exit routes are restricted"],
    lost_child: ["Guardian distress escalating to crowd disturbance", "Secondary separations during search team movements", "Negative media attention affecting venue reputation"],
    crowd_surge: ["Crush injuries in compressed zones", "Barriers becoming trampling hazards", "Secondary surge from panic in adjacent sections"],
    weather: ["Lightning strike injuries in exposed areas", "Flooding of lower concourse infrastructure", "Transportation gridlock preventing egress"]
  };

  const mitigations = {
    medical: ["Pre-positioned medical teams with 2-minute response SLA", "Automated AED deployment at every gate", "Heat monitoring system with proactive cooling stations"],
    fire: ["Zoned fire suppression with automatic activation", "Pre-planned partial evacuation routes for each section", "Fire-rated barriers between concourse segments"],
    power_failure: ["Dual-feed power with automatic failover", "Battery backup for all safety-critical systems", "LED emergency wayfinding in all corridors"],
    security: ["Multi-layer perimeter with redundant screening", "AI-assisted CCTV anomaly detection", "Plain-clothes security teams in high-value areas"],
    lost_child: ["RFID wristband program for children under 12", "Family reunification centers at all quadrants", "Automated gate alert for unaccompanied minors"],
    crowd_surge: ["Real-time density monitoring with automated alerts", "Removable barriers at all concourse junctions", "Counter-flow prevention with one-way gates"],
    weather: ["On-site meteorological monitoring station", "Shelter capacity exceeding venue attendance", "Lightning detection with 30-minute advance warning"]
  };

  const incidentId = `INC-${Date.now().toString(36).toUpperCase()}-${type.slice(0, 3).toUpperCase()}`;

  return {
    incident_id: incidentId,
    generated_at: new Date().toISOString(),
    incident_type: type,
    severity,
    location,
    description,
    affected_count: affectedCount,
    workflow_stage: "responded",

    executive_summary: `${severity.toUpperCase()} ${template.causes[causeIndex].split(" ").slice(0, 3).join(" ").toUpperCase()} INCIDENT at ${location}. ${description} Approximately ${affectedCount} individual(s) affected. Risk score: ${riskScore}/100. ${template.causes[causeIndex]}. Immediate response protocols activated. ${severity === "critical" ? "This incident requires immediate human commander review and approval of escalation actions." : "Standard response procedures are being executed."} All relevant teams have been notified and dispatched per AURA Incident Commander protocol.`,

    root_cause: {
      probable_cause: template.causes[causeIndex],
      contributing_factors: template.factors.slice(0, factorCount),
      confidence: severity === "critical" ? 72 : severity === "high" ? 78 : 85
    },

    immediate_actions: template.actions.map((a) => ({
      ...a,
      eta_minutes: severity === "critical" ? Math.max(1, a.eta_minutes - 1) : a.eta_minutes
    })),

    volunteer_instructions: template.volunteers.map((v) => ({
      ...v,
      zone: v.zone === "Incident Zone" || v.zone === "Search Grid" ? location : v.zone
    })),

    public_announcement: fillTemplate(template.announcement, location),

    multilingual_messages: Object.fromEntries(
      Object.entries(multilingualTemplate).map(([lang, msg]) => [lang, fillTemplate(msg, location)])
    ),

    recovery_plan: template.recovery,

    timeline: buildTimeline(type, severity),

    risk_assessment: {
      overall_risk_score: riskScore,
      likelihood: likelihoodMap[severity] || "Possible",
      impact: impactMap[severity] || "Moderate",
      cascading_risks: (cascadingRisks[type] || cascadingRisks.medical),
      mitigations: (mitigations[type] || mitigations.medical)
    }
  };
}
