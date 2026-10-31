const initialData = {
  stats: {
    totalDeals: 34,
    dealsChange: '+3',
    wonDeals: 20,
    wonChange: '+2',
    lostDeals: 3,
    lostChange: '+1',
    activeEmployees: 48,
    totalPayroll: 312500,
    attendanceRate: 96.4,
    pendingLeaves: 4
  },
  schedule: {
    date: '28 March',
    currentTime: '2:15 pm',
    slots: [
      { id: 's1', time: '30 min', title: '1-on-1 Sync', type: 'quick', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { id: 's2', time: '2:00 pm', title: 'Product Review', type: 'meeting', avatars: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'] },
      { id: 's3', time: '3:00 pm', title: 'Engineering All-Hands', type: 'google-meet', avatars: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'] }
    ]
  },
  leads: [
    {
      id: 'lead-1',
      name: 'Sophia Martinez',
      role: 'Marketing Director at TechNova',
      company: 'TechNova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      interestLevel: 'Hot Client',
      rating: 5,
      sources: ['LinkedIn', 'Email'],
      email: 'sophia.m@technova.io',
      phone: '+1 (555) 234-8901',
      dealValue: 35000,
      status: 'Qualified'
    },
    {
      id: 'lead-2',
      name: 'Liam Anderson',
      role: 'Financial Manager at Vertex',
      company: 'Vertex',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      interestLevel: 'Great interest',
      rating: 5,
      sources: ['LinkedIn', 'Facebook'],
      email: 'liam.anderson@vertex.com',
      phone: '+1 (555) 789-1234',
      dealValue: 42000,
      status: 'Proposal'
    },
    {
      id: 'lead-3',
      name: 'Noah Bennett',
      role: 'Operations Manager at BrightCore',
      company: 'BrightCore',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      interestLevel: 'Medium interest',
      rating: 4,
      sources: ['Typeform'],
      email: 'noah.b@brightcore.net',
      phone: '+1 (555) 456-7890',
      dealValue: 18000,
      status: 'Contacted'
    },
    {
      id: 'lead-4',
      name: 'Ethan Harper',
      role: 'Web Developer at CodeWave',
      company: 'CodeWave',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      interestLevel: 'Low interest',
      rating: 3,
      sources: ['Typeform'],
      email: 'ethan@codewave.dev',
      phone: '+1 (555) 987-6543',
      dealValue: 12000,
      status: 'New'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Google Meet Call',
      clientName: 'David Thompson',
      clientRole: 'CEO at Innovatek',
      clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      taskType: 'Google Meet Call',
      scheduledDate: '28.03.2023',
      scheduledTime: '2 pm',
      status: 'Call scheduled',
      category: 'Hot',
      isHighlight: true,
      attendees: [
        { name: 'Sarah Lee', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
        { name: 'David Thompson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' }
      ]
    },
    {
      id: 'task-2',
      title: 'Send Proposal',
      clientName: 'Ava Williams',
      clientRole: 'CEO at BlueHorizon',
      clientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      taskType: 'Send Proposal',
      amount: '$20,000',
      status: 'Waiting Proposal',
      category: 'Due Today',
      isHighlight: false,
      attendees: []
    },
    {
      id: 'task-3',
      title: 'Google Meet Call',
      clientName: 'Mia Johnson',
      clientRole: 'Brand Manager at Creative Studio',
      clientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      taskType: 'Google Meet Call',
      scheduledDate: '28.03.2023',
      scheduledTime: '8 pm',
      status: 'Call scheduled',
      category: 'Due Today',
      isHighlight: false,
      attendees: [
        { name: 'Mia Johnson', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
        { name: 'Liam Hall', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
      ]
    }
  ],
  employees: [
    {
      id: 'emp-1',
      name: 'Sophia Martinez',
      role: 'Head of People & Culture',
      department: 'Human Resources',
      email: 'sophia.m@taskorbit.com',
      phone: '+1 (555) 234-8901',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      salary: 95000,
      status: 'Active',
      joinDate: '2023-01-15',
      location: 'San Francisco, CA',
      performanceScore: 98,
      skills: ['Talent Acquisition', 'HR Strategy', 'Compensation'],
      reportsTo: 'CEO'
    },
    {
      id: 'emp-2',
      name: 'Liam Anderson',
      role: 'Lead Financial Analyst',
      department: 'Finance',
      email: 'liam.anderson@taskorbit.com',
      phone: '+1 (555) 789-1234',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      salary: 110000,
      status: 'Active',
      joinDate: '2022-08-10',
      location: 'New York, NY',
      performanceScore: 94,
      skills: ['Budgeting', 'Payroll Audit', 'Financial Modeling'],
      reportsTo: 'CFO'
    },
    {
      id: 'emp-3',
      name: 'Noah Bennett',
      role: 'Director of Operations',
      department: 'Operations',
      email: 'noah.b@taskorbit.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      salary: 125000,
      status: 'Active',
      joinDate: '2021-04-20',
      location: 'Austin, TX',
      performanceScore: 91,
      skills: ['Logistics', 'Vendor Management', 'Process Optimization'],
      reportsTo: 'COO'
    },
    {
      id: 'emp-4',
      name: 'Ethan Harper',
      role: 'Senior Full Stack Engineer',
      department: 'Engineering',
      email: 'ethan.h@taskorbit.com',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      salary: 130000,
      status: 'Remote',
      joinDate: '2023-06-01',
      location: 'Seattle, WA',
      performanceScore: 96,
      skills: ['React.js', 'Node.js', 'MongoDB', 'Architecture'],
      reportsTo: 'CTO'
    },
    {
      id: 'emp-5',
      name: 'Mia Johnson',
      role: 'Product Design Lead',
      department: 'Design',
      email: 'mia.j@taskorbit.com',
      phone: '+1 (555) 321-6548',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      salary: 115000,
      status: 'Active',
      joinDate: '2023-03-12',
      location: 'Los Angeles, CA',
      performanceScore: 97,
      skills: ['UI/UX', 'Figma', 'Design Systems', 'Micro-interactions'],
      reportsTo: 'Head of Design'
    },
    {
      id: 'emp-6',
      name: 'Alex Miller',
      role: 'Security & DevOps Lead',
      department: 'Engineering',
      email: 'alex.m@taskorbit.com',
      phone: '+1 (555) 654-9871',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      salary: 140000,
      status: 'Active',
      joinDate: '2022-11-05',
      location: 'Chicago, IL',
      performanceScore: 99,
      skills: ['Cloud Security', 'Kubernetes', 'CI/CD', 'Incident Response'],
      reportsTo: 'CTO'
    }
  ],
  attendance: [
    {
      id: 'att-1',
      employeeId: 'emp-1',
      employeeName: 'Sophia Martinez',
      date: '2026-10-24',
      checkIn: '08:55 AM',
      checkOut: '05:30 PM',
      totalHours: 8.5,
      status: 'Present',
      workType: 'Office'
    },
    {
      id: 'att-2',
      employeeId: 'emp-2',
      employeeName: 'Liam Anderson',
      date: '2026-10-24',
      checkIn: '09:02 AM',
      checkOut: '05:45 PM',
      totalHours: 8.7,
      status: 'Present',
      workType: 'Office'
    },
    {
      id: 'att-3',
      employeeId: 'emp-3',
      employeeName: 'Noah Bennett',
      date: '2026-10-24',
      checkIn: '09:35 AM',
      checkOut: '06:00 PM',
      totalHours: 8.4,
      status: 'Late',
      workType: 'Hybrid'
    },
    {
      id: 'att-4',
      employeeId: 'emp-4',
      employeeName: 'Ethan Harper',
      date: '2026-10-24',
      checkIn: '09:00 AM',
      checkOut: '06:15 PM',
      totalHours: 9.25,
      status: 'Present',
      workType: 'Remote'
    },
    {
      id: 'att-5',
      employeeId: 'emp-5',
      employeeName: 'Mia Johnson',
      date: '2026-10-24',
      checkIn: '08:50 AM',
      checkOut: '05:15 PM',
      totalHours: 8.4,
      status: 'Present',
      workType: 'Office'
    }
  ],
  leaves: [
    {
      id: 'lev-1',
      employeeId: 'emp-3',
      employeeName: 'Noah Bennett',
      employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      leaveType: 'Annual Leave',
      startDate: '2026-11-02',
      endDate: '2026-11-06',
      daysCount: 5,
      reason: 'Family vacation and personal downtime',
      status: 'Pending',
      appliedAt: '2026-10-22'
    },
    {
      id: 'lev-2',
      employeeId: 'emp-2',
      employeeName: 'Liam Anderson',
      employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      leaveType: 'Sick Leave',
      startDate: '2026-10-18',
      endDate: '2026-10-19',
      daysCount: 2,
      reason: 'Seasonal viral fever doctor recommended rest',
      status: 'Approved',
      appliedAt: '2026-10-17'
    },
    {
      id: 'lev-3',
      employeeId: 'emp-4',
      employeeName: 'Ethan Harper',
      employeeAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      leaveType: 'Casual Leave',
      startDate: '2026-10-30',
      endDate: '2026-10-30',
      daysCount: 1,
      reason: 'Home utility relocation',
      status: 'Pending',
      appliedAt: '2026-10-23'
    }
  ],
  payrolls: [
    {
      id: 'pay-1',
      employeeId: 'emp-1',
      employeeName: 'Sophia Martinez',
      employeeRole: 'Head of People & Culture',
      month: 'October 2026',
      baseSalary: 7916,
      bonus: 1000,
      allowance: 450,
      deductions: 320,
      tax: 1450,
      netPayable: 7596,
      paymentStatus: 'Paid',
      paymentDate: '2026-10-20',
      paymentMethod: 'Direct Deposit'
    },
    {
      id: 'pay-2',
      employeeId: 'emp-2',
      employeeName: 'Liam Anderson',
      employeeRole: 'Lead Financial Analyst',
      month: 'October 2026',
      baseSalary: 9166,
      bonus: 1200,
      allowance: 500,
      deductions: 400,
      tax: 1850,
      netPayable: 8616,
      paymentStatus: 'Paid',
      paymentDate: '2026-10-20',
      paymentMethod: 'Direct Deposit'
    },
    {
      id: 'pay-3',
      employeeId: 'emp-3',
      employeeName: 'Noah Bennett',
      employeeRole: 'Director of Operations',
      month: 'October 2026',
      baseSalary: 10416,
      bonus: 800,
      allowance: 600,
      deductions: 350,
      tax: 2100,
      netPayable: 9366,
      paymentStatus: 'Pending',
      paymentDate: '2026-10-28',
      paymentMethod: 'Wire Transfer'
    },
    {
      id: 'pay-4',
      employeeId: 'emp-4',
      employeeName: 'Ethan Harper',
      employeeRole: 'Senior Full Stack Engineer',
      month: 'October 2026',
      baseSalary: 10833,
      bonus: 1500,
      allowance: 650,
      deductions: 420,
      tax: 2280,
      netPayable: 10283,
      paymentStatus: 'Pending',
      paymentDate: '2026-10-28',
      paymentMethod: 'Direct Deposit'
    }
  ],
  summaryWidget: {
    title: 'Summary',
    timeline: [
      { time: '3:15 pm', color: '#BEF264', text: 'Executive brief finalized' },
      { time: '2:46 pm', color: '#38BDF8', text: 'Security review checkpoint' }
    ],
    documents: [
      { name: 'Brief.pdf', size: '2.4 MB', date: '28.03.2023' },
      { name: 'Requirement.pdf', size: '4.8 MB', date: '28.03.2023' }
    ],
    goal: {
      title: 'Security & SLA Benchmark',
      description: 'Reduce the number of security incidents by 50%. This goal is quantitative and measurable, and it would have a significant impact on workforce operations.'
    }
  }
};

module.exports = initialData;
