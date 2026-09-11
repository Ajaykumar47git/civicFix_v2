import { 
  User, 
  IssueCategory, 
  LocationRecord, 
  Issue, 
  NotificationRecord 
} from '../types/database';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'elena.rodriguez@example.com',
    fullName: 'Elena Rodriguez',
    phoneNumber: '+1-202-555-0143',
    role: 'CITIZEN',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-15T08:30:00Z',
    updatedAt: '2026-09-01T14:15:00Z'
  },
  {
    id: 2,
    email: 'marcus.vance@metropolis.gov',
    fullName: 'Marcus Vance',
    phoneNumber: '+1-202-555-0189',
    role: 'FIELD_WORKER',
    status: 'ACTIVE',
    department: 'Public Works - Asphalt Division',
    employeeBadgeNo: 'PW-7741',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-09-08T11:20:00Z'
  },
  {
    id: 3,
    email: 'sarah.connor@metropolis.gov',
    fullName: 'Sarah Connor',
    phoneNumber: '+1-202-555-0199',
    role: 'DISPATCHER',
    status: 'ACTIVE',
    department: 'Municipal Operations Center',
    employeeBadgeNo: 'MOC-102',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-11-20T10:00:00Z',
    updatedAt: '2026-08-20T16:45:00Z'
  },
  {
    id: 4,
    email: 'david.kim@metropolis.gov',
    fullName: 'David Kim',
    phoneNumber: '+1-202-555-0155',
    role: 'SUPERVISOR',
    status: 'ACTIVE',
    department: 'Bureau of Infrastructure Oversight',
    employeeBadgeNo: 'BIO-504',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-05-12T08:00:00Z',
    updatedAt: '2026-09-02T09:10:00Z'
  },
  {
    id: 5,
    email: 'admin.civic@metropolis.gov',
    fullName: 'City Systems Admin',
    phoneNumber: '+1-202-555-0100',
    role: 'ADMIN',
    status: 'ACTIVE',
    department: 'Department of Technology',
    employeeBadgeNo: 'IT-001',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
  }
];

export const MOCK_CATEGORIES: IssueCategory[] = [
  {
    id: 1,
    code: 'ROAD_POTHOLE',
    name: 'Potholes & Pavement Hazard',
    description: 'Cratering asphalt, sinkholes, broken road edges, or hazardous roadway defects.',
    targetDepartment: 'Department of Transportation',
    defaultPriority: 'HIGH',
    defaultSlaHours: 48,
    iconName: 'AlertTriangle',
    colorHex: '#EF4444',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 2,
    code: 'STREETLIGHT_OUT',
    name: 'Streetlight Malfunction',
    description: 'Flickering, damaged, unlit street lamps, or fallen municipal lighting poles.',
    targetDepartment: 'Bureau of Street Lighting',
    defaultPriority: 'MEDIUM',
    defaultSlaHours: 72,
    iconName: 'Lightbulb',
    colorHex: '#F59E0B',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 3,
    code: 'WATER_LEAK',
    name: 'Water Main & Hydrant Leak',
    description: 'Subterranean main breaks, leaking fire hydrants, or high-pressure sewer backups.',
    targetDepartment: 'Water & Sewer Authority',
    defaultPriority: 'CRITICAL',
    defaultSlaHours: 24,
    iconName: 'Droplets',
    colorHex: '#3B82F6',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 4,
    code: 'ILLEGAL_DUMPING',
    name: 'Illegal Dumping & Waste',
    description: 'Abandoned construction debris, hazardous waste, or overflowing public refuse.',
    targetDepartment: 'Department of Sanitation',
    defaultPriority: 'MEDIUM',
    defaultSlaHours: 48,
    iconName: 'Trash2',
    colorHex: '#10B981',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 5,
    code: 'TREE_HAZARD',
    name: 'Fallen Tree & Obstructed Path',
    description: 'Downed tree limbs, root-damaged sidewalk upheavals, or foliage blocking road sightlines.',
    targetDepartment: 'Parks & Urban Forestry',
    defaultPriority: 'HIGH',
    defaultSlaHours: 36,
    iconName: 'Trees',
    colorHex: '#8B5CF6',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const MOCK_LOCATIONS: LocationRecord[] = [
  {
    id: 1,
    latitude: 40.748817,
    longitude: -73.985130,
    formattedAddress: '350 5th Ave, New York, NY 10118',
    streetNumber: '350',
    route: '5th Ave',
    neighborhood: 'Midtown South',
    ward: 'Ward 5',
    city: 'Metropolis',
    state: 'NY',
    postalCode: '10118',
    landmark: 'Adjacent to Empire State Building West Plaza',
    createdAt: '2026-09-08T10:14:00Z'
  },
  {
    id: 2,
    latitude: 40.758896,
    longitude: -73.985130,
    formattedAddress: '1540 Broadway, New York, NY 10036',
    streetNumber: '1540',
    route: 'Broadway',
    neighborhood: 'Theater District',
    ward: 'Ward 5',
    city: 'Metropolis',
    state: 'NY',
    postalCode: '10036',
    landmark: 'Corner of 45th St Pedestrian Crossing',
    createdAt: '2026-09-09T08:22:00Z'
  },
  {
    id: 3,
    latitude: 40.729513,
    longitude: -73.996515,
    formattedAddress: 'Washington Square Park West, New York, NY 10012',
    streetNumber: '42',
    route: 'Washington Square West',
    neighborhood: 'Greenwich Village',
    ward: 'Ward 2',
    city: 'Metropolis',
    state: 'NY',
    postalCode: '10012',
    landmark: 'Near Northwestern Arch Gate',
    createdAt: '2026-09-09T14:40:00Z'
  },
  {
    id: 4,
    latitude: 40.712776,
    longitude: -74.005974,
    formattedAddress: '250 Broadway, New York, NY 10007',
    streetNumber: '250',
    route: 'Broadway',
    neighborhood: 'Civic Center',
    ward: 'Ward 1',
    city: 'Metropolis',
    state: 'NY',
    postalCode: '10007',
    landmark: 'City Hall Park Southern Promenade',
    createdAt: '2026-09-07T11:05:00Z'
  },
  {
    id: 5,
    latitude: 40.771133,
    longitude: -73.974187,
    formattedAddress: '72nd St Transverse, New York, NY 10021',
    streetNumber: '100',
    route: 'Central Park West',
    neighborhood: 'Upper West Side',
    ward: 'Ward 7',
    city: 'Metropolis',
    state: 'NY',
    postalCode: '10021',
    landmark: 'Strawberry Fields Cycling Pathway Entrance',
    createdAt: '2026-09-06T09:30:00Z'
  }
];

export const MOCK_ISSUES: Issue[] = [
  {
    id: 1,
    issueCode: 'CVX-2026-08491',
    reporterId: 1,
    reporterName: 'Elena Rodriguez',
    reporterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    categoryId: 1,
    category: MOCK_CATEGORIES[0],
    locationId: 1,
    location: MOCK_LOCATIONS[0],
    title: 'Severe 2-foot pothole in left bike lane on 5th Ave',
    description: 'Crater has exposed sub-surface rebar and is causing commuter cyclists to swerve into oncoming bus lanes. Multiple riders reported flat tires.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    visibility: 'PUBLIC',
    upvoteCount: 18,
    commentCount: 4,
    slaDeadline: '2026-09-12T10:14:00Z',
    createdAt: '2026-09-10T10:14:00Z',
    updatedAt: '2026-09-10T14:30:00Z',
    photos: [
      {
        id: 1,
        issueId: 1,
        photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=300&auto=format&fit=crop&q=80',
        caption: 'View of pothole depth relative to bike tire',
        gpsLat: 40.748817,
        gpsLng: -73.985130,
        displayOrder: 1,
        fileSizeBytes: 2450800,
        mimeType: 'image/jpeg',
        sha256Hash: 'a8f5c1e92d83b401f782390234a451e9b2341908234a56c0982341efbcda3401',
        capturedAt: '2026-09-10T10:10:00Z',
        uploadedAt: '2026-09-10T10:14:00Z'
      }
    ],
    assignments: [
      {
        id: 1,
        issueId: 1,
        assignedToUserId: 2,
        assignedToName: 'Marcus Vance',
        assignedToBadge: 'PW-7741',
        assignedByUserId: 3,
        assignedByName: 'Sarah Connor',
        departmentName: 'Public Works - Asphalt Division',
        assignmentStatus: 'ON_SITE',
        instructions: 'Hot-mix asphalt overlay required. Apply cold-joint acrylic sealant along lane edge.',
        scheduledFor: '2026-09-10T13:00:00Z',
        deadline: '2026-09-12T10:14:00Z',
        createdAt: '2026-09-10T11:00:00Z',
        updatedAt: '2026-09-10T13:15:00Z'
      }
    ],
    statusHistory: [
      {
        id: 1,
        issueId: 1,
        previousStatus: null,
        newStatus: 'REPORTED',
        changedByUserId: 1,
        changedByUserName: 'Elena Rodriguez',
        changedByUserRole: 'CITIZEN',
        reasonOrNotes: 'Initial report logged through CivicFix mobile portal with photographic proof',
        changeTrigger: 'CITIZEN_SUBMISSION',
        createdAt: '2026-09-10T10:14:00Z'
      },
      {
        id: 2,
        issueId: 1,
        previousStatus: 'REPORTED',
        newStatus: 'UNDER_REVIEW',
        changedByUserId: 3,
        changedByUserName: 'Sarah Connor',
        changedByUserRole: 'DISPATCHER',
        reasonOrNotes: 'Verified EXIF GPS match against 5th Ave bike lane spatial zone; escalated to High Priority',
        changeTrigger: 'MANUAL_TRIAGE',
        createdAt: '2026-09-10T10:45:00Z'
      },
      {
        id: 3,
        issueId: 1,
        previousStatus: 'UNDER_REVIEW',
        newStatus: 'ASSIGNED',
        changedByUserId: 3,
        changedByUserName: 'Sarah Connor',
        changedByUserRole: 'DISPATCHER',
        reasonOrNotes: 'Dispatched to Asphalt Rapid Response Crew 4 under Marcus Vance',
        changeTrigger: 'MANUAL_DISPATCH',
        createdAt: '2026-09-10T11:00:00Z'
      },
      {
        id: 4,
        issueId: 1,
        previousStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        changedByUserId: 2,
        changedByUserName: 'Marcus Vance',
        changedByUserRole: 'FIELD_WORKER',
        reasonOrNotes: 'Crew arrived on site; work area barricaded and hydraulic saw cutting commenced',
        changeTrigger: 'WORKER_CHECK_IN',
        createdAt: '2026-09-10T13:15:00Z'
      }
    ],
    comments: [
      {
        id: 1,
        issueId: 1,
        userId: 1,
        userName: 'Elena Rodriguez',
        userRole: 'CITIZEN',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'Thank you for dispatching so quickly! Will the bike lane remain partially open during the afternoon?',
        isInternalNote: false,
        isFlagged: false,
        createdAt: '2026-09-10T11:30:00Z',
        updatedAt: '2026-09-10T11:30:00Z'
      },
      {
        id: 2,
        issueId: 1,
        userId: 3,
        userName: 'Sarah Connor',
        userRole: 'DISPATCHER',
        userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: 'Hi Elena! Crew 4 has established a safety cone bypass lane. Estimated completion is by 4:30 PM today.',
        isInternalNote: false,
        isFlagged: false,
        createdAt: '2026-09-10T11:42:00Z',
        updatedAt: '2026-09-10T11:42:00Z'
      },
      {
        id: 3,
        issueId: 1,
        userId: 2,
        userName: 'Marcus Vance',
        userRole: 'FIELD_WORKER',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Internal note: Sub-base eroded by underground runoff. Used 2 tons of crushed gravel aggregate before hot asphalt.',
        isInternalNote: true,
        isFlagged: false,
        createdAt: '2026-09-10T14:10:00Z',
        updatedAt: '2026-09-10T14:10:00Z'
      }
    ]
  },
  {
    id: 2,
    issueCode: 'CVX-2026-08492',
    reporterId: 1,
    reporterName: 'Elena Rodriguez',
    categoryId: 3,
    category: MOCK_CATEGORIES[2],
    locationId: 2,
    location: MOCK_LOCATIONS[1],
    title: 'High-pressure water main fissure flooding pedestrian plaza',
    description: 'Sub-surface water main ruptured under Broadway curb. Potable water cascading across sidewalk and flooding subway ventilation grates.',
    status: 'ASSIGNED',
    priority: 'CRITICAL',
    visibility: 'PUBLIC',
    upvoteCount: 34,
    commentCount: 2,
    slaDeadline: '2026-09-11T08:22:00Z',
    createdAt: '2026-09-10T08:22:00Z',
    updatedAt: '2026-09-10T09:15:00Z',
    photos: [
      {
        id: 2,
        issueId: 2,
        photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=300&auto=format&fit=crop&q=80',
        caption: 'Water flooding from pavement seams near Broadway & 45th',
        gpsLat: 40.758896,
        gpsLng: -73.985130,
        displayOrder: 1,
        fileSizeBytes: 3120400,
        mimeType: 'image/jpeg',
        sha256Hash: 'f4b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
        capturedAt: '2026-09-10T08:20:00Z',
        uploadedAt: '2026-09-10T08:22:00Z'
      }
    ],
    assignments: [
      {
        id: 2,
        issueId: 2,
        assignedToUserId: 2,
        assignedToName: 'Marcus Vance',
        assignedToBadge: 'PW-7741',
        assignedByUserId: 3,
        assignedByName: 'Sarah Connor',
        departmentName: 'Water & Sewer Authority',
        assignmentStatus: 'EN_ROUTE',
        instructions: 'Emergency isolation valve shutdown requested from Station 12.',
        deadline: '2026-09-11T08:22:00Z',
        createdAt: '2026-09-10T08:45:00Z',
        updatedAt: '2026-09-10T08:45:00Z'
      }
    ],
    statusHistory: [
      {
        id: 5,
        issueId: 2,
        previousStatus: null,
        newStatus: 'REPORTED',
        changedByUserId: 1,
        changedByUserName: 'Elena Rodriguez',
        changedByUserRole: 'CITIZEN',
        reasonOrNotes: 'High volume leak reported with video and photo upload',
        changeTrigger: 'CITIZEN_SUBMISSION',
        createdAt: '2026-09-10T08:22:00Z'
      },
      {
        id: 6,
        issueId: 2,
        previousStatus: 'REPORTED',
        newStatus: 'ASSIGNED',
        changedByUserId: 3,
        changedByUserName: 'Sarah Connor',
        changedByUserRole: 'DISPATCHER',
        reasonOrNotes: 'Critical tier: Auto-routed directly to emergency water dispatch',
        changeTrigger: 'SLA_CRITICAL_DISPATCH',
        createdAt: '2026-09-10T08:45:00Z'
      }
    ],
    comments: []
  },
  {
    id: 3,
    issueCode: 'CVX-2026-08488',
    reporterId: 1,
    reporterName: 'Elena Rodriguez',
    categoryId: 2,
    category: MOCK_CATEGORIES[1],
    locationId: 3,
    location: MOCK_LOCATIONS[2],
    title: 'Series of 3 darkened streetlamps along Washington Square West',
    description: 'Entire walkway illuminated only by ambient apartment lights. Creates a severe dark corridor adjacent to the children play area.',
    status: 'UNDER_REVIEW',
    priority: 'MEDIUM',
    visibility: 'PUBLIC',
    upvoteCount: 9,
    commentCount: 1,
    slaDeadline: '2026-09-12T14:40:00Z',
    createdAt: '2026-09-09T14:40:00Z',
    updatedAt: '2026-09-09T16:00:00Z',
    photos: [
      {
        id: 3,
        issueId: 3,
        photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
        caption: 'Darkened lampposts #WSP-12 through #WSP-14',
        displayOrder: 1,
        fileSizeBytes: 1840000,
        mimeType: 'image/jpeg',
        sha256Hash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
        uploadedAt: '2026-09-09T14:40:00Z'
      }
    ],
    assignments: [],
    statusHistory: [
      {
        id: 7,
        issueId: 3,
        previousStatus: null,
        newStatus: 'REPORTED',
        changedByUserId: 1,
        changedByUserName: 'Elena Rodriguez',
        changedByUserRole: 'CITIZEN',
        reasonOrNotes: 'Night photo uploaded detailing unlit walking path',
        changeTrigger: 'CITIZEN_SUBMISSION',
        createdAt: '2026-09-09T14:40:00Z'
      },
      {
        id: 8,
        issueId: 3,
        previousStatus: 'REPORTED',
        newStatus: 'UNDER_REVIEW',
        changedByUserId: 3,
        changedByUserName: 'Sarah Connor',
        changedByUserRole: 'DISPATCHER',
        reasonOrNotes: 'Cross-referencing with Parks Department circuit breaker maintenance schedule',
        changeTrigger: 'MANUAL_TRIAGE',
        createdAt: '2026-09-09T16:00:00Z'
      }
    ],
    comments: []
  },
  {
    id: 4,
    issueCode: 'CVX-2026-08470',
    reporterId: 1,
    reporterName: 'Elena Rodriguez',
    categoryId: 4,
    category: MOCK_CATEGORIES[3],
    locationId: 4,
    location: MOCK_LOCATIONS[3],
    title: 'Commercial renovation debris dumped across City Hall promenade',
    description: 'Drywall stacks, lead paint cans, and broken tiles dumped unlawfully in public walkway overnight.',
    status: 'RESOLVED',
    priority: 'HIGH',
    visibility: 'PUBLIC',
    upvoteCount: 22,
    commentCount: 3,
    slaDeadline: '2026-09-09T11:05:00Z',
    resolvedAt: '2026-09-08T16:20:00Z',
    createdAt: '2026-09-07T11:05:00Z',
    updatedAt: '2026-09-08T16:30:00Z',
    photos: [
      {
        id: 4,
        issueId: 4,
        photoUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=300&auto=format&fit=crop&q=80',
        caption: 'Piles of construction rubble blocking pathway',
        displayOrder: 1,
        fileSizeBytes: 2900000,
        mimeType: 'image/jpeg',
        sha256Hash: '99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa',
        uploadedAt: '2026-09-07T11:05:00Z'
      }
    ],
    assignments: [
      {
        id: 3,
        issueId: 4,
        assignedToUserId: 2,
        assignedToName: 'Marcus Vance',
        assignedToBadge: 'PW-7741',
        assignedByUserId: 3,
        assignedByName: 'Sarah Connor',
        departmentName: 'Department of Sanitation',
        assignmentStatus: 'COMPLETED',
        instructions: 'Heavy loader truck needed; inspect debris for contractor shipping labels to support fine issuance.',
        completedAt: '2026-09-08T16:00:00Z',
        deadline: '2026-09-09T11:05:00Z',
        createdAt: '2026-09-07T12:00:00Z',
        updatedAt: '2026-09-08T16:00:00Z'
      }
    ],
    statusHistory: [
      {
        id: 9,
        issueId: 4,
        previousStatus: null,
        newStatus: 'REPORTED',
        changedByUserId: 1,
        changedByUserName: 'Elena Rodriguez',
        changedByUserRole: 'CITIZEN',
        changeTrigger: 'CITIZEN_SUBMISSION',
        createdAt: '2026-09-07T11:05:00Z'
      },
      {
        id: 10,
        issueId: 4,
        previousStatus: 'REPORTED',
        newStatus: 'ASSIGNED',
        changedByUserId: 3,
        changedByUserName: 'Sarah Connor',
        changedByUserRole: 'DISPATCHER',
        changeTrigger: 'MANUAL_DISPATCH',
        createdAt: '2026-09-07T12:00:00Z'
      },
      {
        id: 11,
        issueId: 4,
        previousStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS',
        changedByUserId: 2,
        changedByUserName: 'Marcus Vance',
        changedByUserRole: 'FIELD_WORKER',
        changeTrigger: 'WORKER_CHECK_IN',
        createdAt: '2026-09-08T13:30:00Z'
      },
      {
        id: 12,
        issueId: 4,
        previousStatus: 'IN_PROGRESS',
        newStatus: 'RESOLVED',
        changedByUserId: 2,
        changedByUserName: 'Marcus Vance',
        changedByUserRole: 'FIELD_WORKER',
        reasonOrNotes: 'Rubble cleared with Sanitation flatbed #18; site pressure-washed and sanitized',
        changeTrigger: 'RESOLUTION_SUBMISSION',
        createdAt: '2026-09-08T16:20:00Z'
      }
    ],
    comments: [],
    resolutionProof: {
      id: 1,
      issueId: 4,
      workerId: 2,
      workerName: 'Marcus Vance',
      workDescription: 'Removed 1.8 metric tons of illegal demolition refuse. Pressure washed flagstones. Evidence photos collected of shipping labels and handed over to City Code Enforcement.',
      beforePhotoUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&auto=format&fit=crop&q=80',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      laborHours: 4.0,
      materialsCost: 320.00,
      verificationStatus: 'PENDING_REVIEW',
      createdAt: '2026-09-08T16:20:00Z',
      updatedAt: '2026-09-08T16:20:00Z'
    }
  },
  {
    id: 5,
    issueCode: 'CVX-2026-08455',
    reporterId: 1,
    reporterName: 'Elena Rodriguez',
    categoryId: 5,
    category: MOCK_CATEGORIES[4],
    locationId: 5,
    location: MOCK_LOCATIONS[4],
    title: 'Large oak branch snapped and blocking Central Park bike path',
    description: 'Heavy wind snapped 12-inch diameter oak limb across the cycling path near Strawberry Fields entrance.',
    status: 'VERIFIED',
    priority: 'HIGH',
    visibility: 'PUBLIC',
    upvoteCount: 41,
    commentCount: 5,
    slaDeadline: '2026-09-07T21:30:00Z',
    resolvedAt: '2026-09-07T14:00:00Z',
    closedAt: '2026-09-07T17:30:00Z',
    createdAt: '2026-09-06T09:30:00Z',
    updatedAt: '2026-09-07T17:30:00Z',
    photos: [
      {
        id: 5,
        issueId: 5,
        photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
        caption: 'Broken limb spanning both directions of pathway',
        displayOrder: 1,
        fileSizeBytes: 3450000,
        mimeType: 'image/jpeg',
        sha256Hash: '44556677889900112233aabbccddeeff44556677889900112233aabbccddeeff',
        uploadedAt: '2026-09-06T09:30:00Z'
      }
    ],
    assignments: [
      {
        id: 4,
        issueId: 5,
        assignedToUserId: 2,
        assignedToName: 'Marcus Vance',
        assignedToBadge: 'PW-7741',
        assignedByUserId: 3,
        assignedByName: 'Sarah Connor',
        departmentName: 'Parks & Urban Forestry',
        assignmentStatus: 'COMPLETED',
        completedAt: '2026-09-07T13:45:00Z',
        deadline: '2026-09-07T21:30:00Z',
        createdAt: '2026-09-06T10:00:00Z',
        updatedAt: '2026-09-07T13:45:00Z'
      }
    ],
    statusHistory: [
      {
        id: 13,
        issueId: 5,
        previousStatus: null,
        newStatus: 'REPORTED',
        changedByUserId: 1,
        changedByUserName: 'Elena Rodriguez',
        changedByUserRole: 'CITIZEN',
        changeTrigger: 'CITIZEN_SUBMISSION',
        createdAt: '2026-09-06T09:30:00Z'
      },
      {
        id: 14,
        issueId: 5,
        previousStatus: 'REPORTED',
        newStatus: 'ASSIGNED',
        changedByUserId: 3,
        changedByUserName: 'Sarah Connor',
        changedByUserRole: 'DISPATCHER',
        changeTrigger: 'MANUAL_DISPATCH',
        createdAt: '2026-09-06T10:00:00Z'
      },
      {
        id: 15,
        issueId: 5,
        previousStatus: 'ASSIGNED',
        newStatus: 'RESOLVED',
        changedByUserId: 2,
        changedByUserName: 'Marcus Vance',
        changedByUserRole: 'FIELD_WORKER',
        reasonOrNotes: 'Chainsaw crew sectioned trunk into mulch logs; path swept clean',
        changeTrigger: 'RESOLUTION_SUBMISSION',
        createdAt: '2026-09-07T14:00:00Z'
      },
      {
        id: 16,
        issueId: 5,
        previousStatus: 'RESOLVED',
        newStatus: 'VERIFIED',
        changedByUserId: 4,
        changedByUserName: 'David Kim',
        changedByUserRole: 'SUPERVISOR',
        reasonOrNotes: 'Inspector verified clearance on site; citizen Elena confirmed satisfaction',
        changeTrigger: 'SUPERVISOR_APPROVAL',
        createdAt: '2026-09-07T17:30:00Z'
      }
    ],
    comments: [],
    resolutionProof: {
      id: 2,
      issueId: 5,
      workerId: 2,
      workerName: 'Marcus Vance',
      verifiedByUserId: 4,
      verifiedByName: 'David Kim',
      workDescription: 'Sectioned trunk using Stihl MS261 chainsaw. Loaded timber into Parks woodchipper. Cleared sawdust and branch twigs.',
      beforePhotoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      laborHours: 2.5,
      materialsCost: 85.00,
      verificationStatus: 'APPROVED',
      citizenFeedback: 'Incredible speed! The path was cleared and open for my morning bike ride.',
      citizenRating: 5,
      verifiedAt: '2026-09-07T17:30:00Z',
      createdAt: '2026-09-07T14:00:00Z',
      updatedAt: '2026-09-07T17:30:00Z'
    }
  }
];

export const MOCK_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 1,
    userId: 1,
    issueId: 1,
    title: 'Work Crew On Site (CVX-2026-08491)',
    message: 'Public Works Crew 4 (Lead Marcus Vance) has arrived on site at 5th Ave to repair the pothole you reported.',
    notificationType: 'STATUS_UPDATE',
    deliveryChannel: 'IN_APP',
    isRead: false,
    createdAt: '2026-09-10T13:15:00Z'
  },
  {
    id: 2,
    userId: 1,
    issueId: 2,
    title: 'Critical Emergency Dispatch (CVX-2026-08492)',
    message: 'Your report of a water main rupture on Broadway has been escalated to Priority CRITICAL and dispatched.',
    notificationType: 'STATUS_UPDATE',
    deliveryChannel: 'SMS',
    isRead: true,
    readAt: '2026-09-10T08:50:00Z',
    createdAt: '2026-09-10T08:45:00Z'
  },
  {
    id: 3,
    userId: 1,
    issueId: 5,
    title: 'Issue Verified & Closed (CVX-2026-08455)',
    message: 'Supervisor David Kim has officially verified the clearance of the fallen tree on the Central Park path.',
    notificationType: 'RESOLUTION_VERIFIED',
    deliveryChannel: 'IN_APP',
    isRead: true,
    readAt: '2026-09-07T18:00:00Z',
    createdAt: '2026-09-07T17:30:00Z'
  }
];

export const INITIAL_USERS = MOCK_USERS;
export const INITIAL_CATEGORIES = MOCK_CATEGORIES;
export const INITIAL_ISSUES = MOCK_ISSUES;
export const INITIAL_NOTIFICATIONS = MOCK_NOTIFICATIONS;
