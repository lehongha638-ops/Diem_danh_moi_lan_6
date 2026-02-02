/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import DottedGlowBackground from './components/DottedGlowBackground';
import { 
    BriefcaseIcon, UserIcon, UsersIcon, UserCheckIcon, 
    FaceIdIcon, HistoryIcon, FileTextIcon, MailIcon, BellIcon,
    ChevronRightIcon, GridIcon, ArrowLeftIcon, ArrowRightIcon,
    ImageIcon, SearchIcon, BuildingIcon, CalendarIcon, ChevronDownIcon,
    UsersGroupIcon, CheckIcon, WarningIcon,
    CameraIcon, UploadIcon, InfoIcon, FaceOutlineIcon, VideoCameraIcon,
    EyeIcon,
    DownloadIcon,
    CodeIcon,
    ClockIcon,
    ThinkingIcon,
    CheckCircleIcon,
    XCircleIcon,
} from './components/Icons';

// FIX: Added missing | in type definition
type Role = 'teacher' | 'parent' | 'student' | 'head_teacher' | 'principal';
type View = 'landing' | 'role-selection' | Role;
type AttendanceStatus = 'present' | 'absent_p' | 'absent_np' | 'unrecognized' | 'late';
type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

interface Student {
    id: string;
    name: string;
    status: AttendanceStatus;
}

interface SessionRecord {
    am: Student[];
    pm: Student[];
}

interface AttendanceRecord {
    date: string; // YYYY-MM-DD
    sessions: SessionRecord;
}

interface WeeklyAttendanceData {
  [date: string]: SessionRecord;
}

interface LeaveRequest {
    id: string;
    studentId: string;
    studentName: string;
    parentName: string;
    leaveDate: string; // YYYY-MM-DD
    reason: string;
    status: LeaveRequestStatus;
    approvedBy?: string;
}

interface Notification {
    id: string;
    studentId?: string; // Optional: for student-specific notifications
    type: 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

// --- Time Settings Interfaces ---
interface ClassTimeSettings {
    am: string;
    pm: string;
}

interface Period {
    start: string;
    end: string;
}

interface LessonPeriodSettings {
    am: Period[];
    pm: Period[];
}


// --- MOCK DATA ---
const mockStudentsData: Student[] = [
    { id: 'HS001', name: 'Nguyễn Văn An', status: 'present' },
    { id: 'HS002', name: 'Trần Thị Bình', status: 'present' },
    { id: 'HS003', name: 'Lê Minh Cường', status: 'absent_np' },
    { id: 'HS004', name: 'Phạm Thị Dung', status: 'absent_p' },
    { id: 'HS005', name: 'Hoàng Văn Em', status: 'unrecognized' },
    { id: 'HS006', name: 'Vũ Thị Hằng', status: 'present' },
    { id: 'HS007', name: 'Đặng Thị Lan', status: 'late' },
    { id: 'HS008', name: 'Bùi Văn Hùng', status: 'present' },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

const formatDateForID = (date: Date) => date.toISOString().split('T')[0];

const mockLeaveRequestsData: LeaveRequest[] = [
    {
        id: 'req1',
        studentId: 'HS004',
        studentName: 'Phạm Thị Dung',
        parentName: 'Phạm Văn Long',
        leaveDate: formatDateForID(today),
        reason: 'Con bị sốt cao, gia đình đã cho con đi khám và bác sĩ yêu cầu nghỉ ngơi tại nhà. Xin phép cho con nghỉ học ngày hôm nay để theo dõi sức khỏe. Gia đình xin chân thành cảm ơn.',
        status: 'approved',
        approvedBy: 'GVCN: Nguyễn Thu An',
    },
    {
        id: 'req2',
        studentId: 'HS002',
        studentName: 'Trần Thị Bình',
        parentName: 'Trần Văn Bách',
        leaveDate: formatDateForID(yesterday),
        reason: 'Con có lịch tái khám nha khoa, gia đình xin phép cho con nghỉ buổi sáng.',
        status: 'approved',
        approvedBy: 'GVCN: Nguyễn Thu An',
    },
    {
        id: 'req3',
        studentId: 'HS003',
        studentName: 'Lê Minh Cường',
        parentName: 'Lê Thị Hoa',
        leaveDate: formatDateForID(today),
        reason: 'Gia đình có việc đột xuất, xin cho cháu nghỉ.',
        status: 'pending'
    },
    {
        id: 'req4',
        studentId: 'HS002',
        studentName: 'Trần Thị Bình',
        parentName: 'Trần Văn Bách',
        leaveDate: formatDateForID(threeDaysAgo),
        reason: 'Xin nghỉ phép đi du lịch cùng gia đình.',
        status: 'rejected'
    },
    {
        id: 'req5',
        studentId: 'HS001',
        studentName: 'Nguyễn Văn An',
        parentName: 'Nguyễn Thị D',
        leaveDate: formatDateForID(today),
        reason: 'Con bị đau bụng, gia đình xin phép cho con nghỉ buổi chiều để theo dõi.',
        status: 'pending'
    }
];


const mockHistoryData: AttendanceRecord[] = [
    {
        date: formatDateForID(yesterday), // Trần Thị Bình vắng có phép buổi sáng
        sessions: {
            am: [
                { id: 'HS001', name: 'Nguyễn Văn An', status: 'present' },
                { id: 'HS002', name: 'Trần Thị Bình', status: 'absent_p' }, // Consistent with leave request
                { id: 'HS003', name: 'Lê Minh Cường', status: 'present' },
                { id: 'HS004', name: 'Phạm Thị Dung', status: 'present' },
                { id: 'HS005', name: 'Hoàng Văn Em', status: 'present' },
                { id: 'HS006', name: 'Vũ Thị Hằng', status: 'present' },
            ],
            pm: [
                { id: 'HS001', name: 'Nguyễn Văn An', status: 'present' },
                { id: 'HS002', name: 'Trần Thị Bình', status: 'present' },
                { id: 'HS003', name: 'Lê Minh Cường', status: 'present' },
                { id: 'HS004', name: 'Phạm Thị Dung', status: 'present' },
                { id: 'HS005', name: 'Hoàng Văn Em', status: 'present' },
                { id: 'HS006', name: 'Vũ Thị Hằng', status: 'present' },
            ]
        }
    },
    {
        date: formatDateForID(twoDaysAgo), // Trần Thị Bình vắng không phép buổi chiều
        sessions: {
            am: [
                { id: 'HS001', name: 'Nguyễn Văn An', status: 'present' },
                { id: 'HS002', name: 'Trần Thị Bình', status: 'present' },
                { id: 'HS003', name: 'Lê Minh Cường', status: 'absent_np' },
                { id: 'HS004', name: 'Phạm Thị Dung', status: 'present' },
                { id: 'HS005', name: 'Hoàng Văn Em', status: 'unrecognized' },
                { id: 'HS006', name: 'Vũ Thị Hằng', status: 'present' },
            ],
            pm: [
                { id: 'HS001', name: 'Nguyễn Văn An', status: 'present' },
                { id: 'HS002', name: 'Trần Thị Bình', status: 'absent_np' }, // Warning notification trigger
                { id: 'HS003', name: 'Lê Minh Cường', status: 'absent_np' },
                { id: 'HS004', name: 'Phạm Thị Dung', status: 'present' },
                { id: 'HS005', name: 'Hoàng Văn Em', status: 'present' },
                { id: 'HS006', name: 'Vũ Thị Hằng', status: 'present' },
            ]
        }
    },
     {
        date: formatDateForID(threeDaysAgo), // All present
        sessions: {
            am: mockStudentsData.map(s => ({ ...s, status: 'present' })),
            pm: mockStudentsData.map(s => ({ ...s, status: 'present' })),
        }
    }
];

const mockNotifications: Notification[] = [
    {
        id: 'notif1',
        studentId: 'HS003',
        type: 'warning',
        title: 'Vắng không phép',
        message: 'Học sinh Lê Minh Cường vắng mặt không phép.',
        timestamp: '8:05, Hôm nay',
        read: false,
    },
    {
        id: 'notif2',
        studentId: 'HS004',
        type: 'info',
        title: 'Vắng có phép',
        message: 'Phụ huynh học sinh Phạm Thị Dung đã gửi đơn xin nghỉ.',
        timestamp: '7:45, Hôm nay',
        read: false,
    },
    {
        id: 'notif3',
        studentId: 'HS005',
        type: 'warning',
        title: 'Chưa nhận diện',
        message: 'Không thể nhận diện học sinh Hoàng Văn Em.',
        timestamp: '8:10, Hôm nay',
        read: true,
    },
    {
        id: 'notif4',
        studentId: 'HS002',
        type: 'info',
        title: 'Đơn nghỉ được duyệt',
        message: 'Đơn xin nghỉ cho học sinh Trần Thị Bình ngày hôm qua đã được duyệt.',
        timestamp: '16:30, Hôm qua',
        read: false,
    },
    {
        id: 'notif5',
        studentId: 'HS002',
        type: 'warning',
        title: 'Vắng không phép',
        message: 'Học sinh Trần Thị Bình vắng mặt không phép buổi chiều 2 ngày trước.',
        timestamp: '14:15, 2 ngày trước',
        read: true,
    },
];

type TrainingStatus = 'trained' | 'not_trained' | 'training';

interface TeacherFaceData {
    stt: number;
    name: string;
    photoCount: number;
    teacherId: string;
    trainingStatus: TrainingStatus;
    requiresPhotoUpdate?: boolean;
}

const mockTeacherFaceData: TeacherFaceData[] = [
    { stt: 1, name: 'Dư Nguyễn Hà', photoCount: 1, teacherId: '7903641337', trainingStatus: 'training' },
    { stt: 2, name: 'Nhữ Hòa', photoCount: 1, teacherId: '7903723950', trainingStatus: 'trained' },
    { stt: 3, name: 'Hoàng Thị Lan', photoCount: 1, teacherId: '7903671242', trainingStatus: 'trained' },
    { stt: 4, name: 'Lê Thị Bích Thảo', photoCount: 1, teacherId: '7903702768', trainingStatus: 'trained' },
    { stt: 5, name: 'Lâm Nguyễn Phương Ân', photoCount: 0, teacherId: '7903536423', trainingStatus: 'not_trained', requiresPhotoUpdate: true },
    { stt: 6, name: 'Lê Tuấn Huy', photoCount: 0, teacherId: '7903670419', trainingStatus: 'not_trained' },
    { stt: 7, name: 'Ngô Văn Trường', photoCount: 0, teacherId: '7903669654', trainingStatus: 'not_trained' },
    { stt: 8, name: 'Trần Thanh Khang', photoCount: 0, teacherId: '7903669885', trainingStatus: 'not_trained' },
];

interface ClassRecognitionStatus {
  id: string;
  name: string;
  recognized: number;
  total: number;
  isTeacherClass?: boolean;
}

const mockClassRecognitionData: ClassRecognitionStatus[] = [
  { id: 'gv', name: 'Lớp Giáo viên', recognized: 6, total: 54, isTeacherClass: true },
  { id: '1.1', name: 'Lớp 1.1', recognized: 29, total: 40 },
  { id: '1.2', name: 'Lớp 1.2', recognized: 31, total: 40 },
  { id: '1.3', name: 'Lớp 1.3', recognized: 35, total: 38 },
  { id: '2.1', name: 'Lớp 2.1', recognized: 30, total: 32 },
];


const statusOptions: Record<AttendanceStatus, string> = {
    present: 'Có mặt',
    late: 'Đi muộn',
    absent_p: 'Vắng CP',
    absent_np: 'Vắng KP',
    unrecognized: 'Chưa nhận diện'
};


// --- MODAL COMPONENT ---
const Modal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode; 
    footer: React.ReactNode;
    className?: string;
}> = ({ isOpen, onClose, title, children, footer, className = '' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    {footer}
                </div>
            </div>
        </div>
    );
};

// --- NOTIFICATION COMPONENT ---
const NotificationBell: React.FC<{ notifications: Notification[] }> = ({ notifications }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const getIconForType = (type: 'warning' | 'info') => {
        switch (type) {
            case 'warning': return <WarningIcon />;
            case 'info': return <InfoIcon />;
            default: return null;
        }
    };

    return (
        <div className="notification-area">
            <button className="notification-button" onClick={() => setIsOpen(!isOpen)}>
                <BellIcon />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h4>Thông báo</h4>
                    </div>
                    <ul className="notification-list">
                        {notifications.length > 0 ? notifications.map(notif => (
                            <li key={notif.id} className={`notification-item ${notif.read ? 'read' : ''}`}>
                                <div className={`notification-icon icon-${notif.type}`}>
                                    {getIconForType(notif.type)}
                                </div>
                                <div className="notification-content">
                                    <p className="notification-title">{notif.title}</p>
                                    <p className="notification-message">{notif.message}</p>
                                    <p className="notification-timestamp">{notif.timestamp}</p>
                                </div>
                            </li>
                        )) : <li className="notification-empty">Không có thông báo mới.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- DASHBOARD COMPONENTS ---
const Dashboard: React.FC<{ role: string; onBack: () => void; children: React.ReactNode; onOpenWorkflow: () => void; onOpenTestCases: () => void; notifications: Notification[]; }> = ({ role, children, onBack, onOpenWorkflow, onOpenTestCases, notifications }) => (
    <div className="dashboard-container">
        <header className="dashboard-header">
            <div className="header-left">
                 <button onClick={onBack} className="back-button">&larr; Chọn lại vai trò</button>
                 <h1>Module Điểm danh: <span className="role-name">{role}</span></h1>
            </div>
            <div className="header-right">
                <button className="workflow-button-header" onClick={onOpenWorkflow}>
                    Xem quy trình
                </button>
                <button className="workflow-button-header" onClick={onOpenTestCases}>
                    Kịch bản test
                </button>
                <NotificationBell notifications={notifications} />
            </div>
        </header>
        {children}
    </div>
);

// --- DATE HELPERS ---
const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}): string => {
    return date.toLocaleDateString('vi-VN', options);
};

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const other = new Date(date);
    other.setHours(0, 0, 0, 0);
    return other < today;
};

const isFuture = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const other = new Date(date);
    other.setHours(0, 0, 0, 0);
    return other > today;
};

// --- DATA HELPERS ---
const createSessionData = (): Student[] => JSON.parse(JSON.stringify(mockStudentsData.map(s => ({...s, status: 'unrecognized' as AttendanceStatus}))));

const generateInitialWeeklyData = (startDate: Date): WeeklyAttendanceData => {
    const weekData: WeeklyAttendanceData = {};
    for (let i = 0; i < 7; i++) {
        const day = addDays(startDate, i);
        const dateStr = formatDateForID(day);
        weekData[dateStr] = {
            am: createSessionData(),
            pm: createSessionData(),
        };
    }
    // Pre-populate today's AM session with some data for demonstration
    const todayStr = formatDateForID(new Date());
    if (weekData[todayStr]) {
        weekData[todayStr].am = JSON.parse(JSON.stringify(mockStudentsData));
    }
    return weekData;
};

const RecognitionHistoryView = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const stats = {
        students: { recognized: 826, total: 1088 },
        teachers: { recognized: 6, total: 54 },
        classes: 30,
        totalRecognitions: 832
    };

    const handlePrevDay = () => setSelectedDate(prev => addDays(prev, -1));
    const handleNextDay = () => {
        if (!isToday(selectedDate)) {
             setSelectedDate(prev => addDays(prev, 1));
        }
    };
    const handleToday = () => setSelectedDate(new Date());

    return (
        <div className="recognition-history-page">
            <div className="page-header">
                <h2>Lịch sử nhận diện - Trường PTIT</h2>
            </div>
            
            <div className="date-selector-bar">
                <div className="date-display">
                    <CalendarIcon /> 
                    Ngày: {isToday(selectedDate) 
                        ? 'Hôm nay' 
                        : formatDate(selectedDate, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <div className="date-picker-controls">
                    <button className="date-nav-button" onClick={handlePrevDay}>
                        &lt; {formatDate(addDays(selectedDate, -1), { day: '2-digit', month: '2-digit' })}
                    </button>
                    <button 
                        className={`today-button ${isToday(selectedDate) ? 'active' : ''}`} 
                        onClick={handleToday}
                    >
                        Hôm nay
                    </button>
                    <button 
                        className="date-nav-button" 
                        onClick={handleNextDay} 
                        disabled={isToday(selectedDate)}
                    >
                        {formatDate(addDays(selectedDate, 1), { day: '2-digit', month: '2-digit' })} &gt;
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card students">
                    <div className="stat-value">{stats.students.recognized}/{stats.students.total}</div>
                    <div className="stat-label">Học sinh nhận diện</div>
                </div>
                <div className="stat-card teachers">
                    <div className="stat-value">{stats.teachers.recognized}/{stats.teachers.total}</div>
                    <div className="stat-label">Giáo viên nhận diện</div>
                </div>
                <div className="stat-card classes">
                    <div className="stat-value">{stats.classes}</div>
                    <div className="stat-label">Số lớp</div>
                </div>
                <div className="stat-card total">
                    <div className="stat-value">{stats.totalRecognitions}</div>
                    <div className="stat-label">Tổng lượt nhận diện</div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="filter-dropdown">
                    <span>Tất cả các lớp</span>
                    <ChevronDownIcon />
                </div>
                <div className="filter-search">
                    <SearchIcon />
                    <input type="text" placeholder="Tìm kiếm theo mã hoặc, tên học sinh/giáo viên..." />
                </div>
            </div>

            <div className="class-list-container">
                <div className="class-list-header">
                    <BuildingIcon />
                    <h3>Danh sách nhận diện theo lớp</h3>
                </div>
                <div className="class-list">
                    {mockClassRecognitionData.map(cls => (
                        <div key={cls.id} className="class-list-item">
                            <div className="class-name">
                                <ChevronRightIcon />
                                {cls.isTeacherClass ? <UsersGroupIcon /> : <UsersIcon />}
                                <span>{cls.name}</span>
                            </div>
                            <div className="class-status-tags">
                                <div className="tag-recognized">
                                    <CheckIcon />
                                    <span>{cls.recognized}/{cls.total}</span>
                                </div>
                                <div className="tag-unrecognized">
                                    <WarningIcon />
                                    <span>{cls.total - cls.recognized} chưa nhận diện</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AiTrainingStatusWidget: React.FC = () => {
    return (
      <div className="ai-training-widget" role="alert">
        <ThinkingIcon />
        <div>
          <p className="widget-title">AI đang học...</p>
          <p className="widget-text">Dự kiến hoàn thành sau 24h.</p>
        </div>
      </div>
    );
};


const TeacherView = ({ onBack, onOpenWorkflow, onOpenTestCases }: { onBack: () => void; onOpenWorkflow: () => void; onOpenTestCases: () => void; }) => {
    // FIX: Set default tab to 'face-registration' for better workflow
    const [activeTab, setActiveTab] = useState('face-registration');
    
    // Take Attendance tab state
    const [currentWeekData, setCurrentWeekData] = useState<WeeklyAttendanceData>(() => generateInitialWeeklyData(getWeekStart(new Date())));
    const [selectedDay, setSelectedDay] = useState<Date>(new Date());
    const [selectedSession, setSelectedSession] = useState<'am' | 'pm'>('am');

    // Face registration state
    const [searchTerm, setSearchTerm] = useState('');
    const [faceRegTab, setFaceRegTab] = useState('original');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherFaceData | null>(null);
    const [recognitionImages, setRecognitionImages] = useState<string[]>([]);
    const recognitionFileInputRef = useRef<HTMLInputElement>(null);
    const [modalImages, setModalImages] = useState<string[]>([]);
    const originalPhotoInputRef = useRef<HTMLInputElement>(null);


    // Modal state for reason
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [changeReason, setChangeReason] = useState('');

    // Modal state for success confirmation
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Modal state for leave requests
    const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState(false);
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequestsData);
    const [leaveRequestSubTab, setLeaveRequestSubTab] = useState('pending');


    // Reports tab state
    const [reportType, setReportType] = useState('day');
    const [reportValue, setReportValue] = useState(formatDateForID(new Date()));
    const [reportSearchTerm, setReportSearchTerm] = useState('');
    
    // Time setup state
    const initialClassTimes: ClassTimeSettings = { am: '07:30', pm: '13:30' };
    const initialLessonPeriods: LessonPeriodSettings = {
        am: [
            { start: '07:45', end: '08:30' },
            { start: '08:40', end: '09:25' },
            { start: '09:35', end: '10:20' },
            { start: '10:30', end: '11:15' },
            { start: '11:25', end: '12:10' },
        ],
        pm: [
            { start: '13:45', end: '14:30' },
            { start: '14:40', end: '15:25' },
            { start: '15:35', end: '16:20' },
            { start: '16:30', end: '17:15' },
            { start: '17:25', end: '18:10' },
        ],
    };

    const [classTimes, setClassTimes] = useState<ClassTimeSettings>(initialClassTimes);
    const [lessonPeriods, setLessonPeriods] = useState<LessonPeriodSettings>(initialLessonPeriods);


    const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
        const selectedDateStr = formatDateForID(selectedDay);
        
        setCurrentWeekData(prevData => {
            const newData = { ...prevData };
            const dayData = { ...newData[selectedDateStr] };
            const sessionData = [...dayData[selectedSession]];
            const studentIndex = sessionData.findIndex(s => s.id === studentId);
            
            if (studentIndex > -1) {
                // Prevent unnecessary updates
                if (sessionData[studentIndex].status === newStatus) return prevData;
                sessionData[studentIndex] = { ...sessionData[studentIndex], status: newStatus };
            }

            dayData[selectedSession] = sessionData;
            newData[selectedDateStr] = dayData;
            return newData;
        });
    };

    const handleSaveClick = () => {
        if (isFuture(selectedDay)) {
            // This case should not be reachable as the button is disabled.
            return;
        }
        if (isToday(selectedDay)) {
            // In a real app, this would be an API call
            console.log("Saving today's data:", currentWeekData[formatDateForID(selectedDay)][selectedSession]);
            setSuccessMessage('Đã lưu điểm danh thành công!');
            setShowSuccessModal(true);
        } else { // Catches all past dates
            setIsModalOpen(true);
        }
    };

    const handleConfirmSaveWithReason = () => {
        if (!changeReason.trim()) {
            alert('Vui lòng nhập lý do giải trình.');
            return;
        }
    
        const selectedDateStr = formatDateForID(selectedDay);
    
        // In a real app, this would be an API call with the data and reason
        console.log(`SAVING PAST DATA with reason:\nDate: ${selectedDateStr}\nSession: ${selectedSession.toUpperCase()}\nReason: ${changeReason}`);
        console.log("Data:", currentWeekData[selectedDateStr][selectedSession]);

        handleCloseModal();
        setSuccessMessage('Đã lưu thay đổi và gửi giải trình thành công!');
        setShowSuccessModal(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setChangeReason('');
    };

    const handleOpenUploadModal = (teacher: TeacherFaceData) => {
        setSelectedTeacher(teacher);
        setModalImages([]); // Reset images when opening
        setIsUploadModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsUploadModalOpen(false);
        setSelectedTeacher(null);
    };

    const handleRecognitionUploadClick = () => {
        recognitionFileInputRef.current?.click();
    };
    
    const handleOriginalPhotoUploadClick = () => {
        originalPhotoInputRef.current?.click();
    };

    const processFiles = (files: FileList | null, setImageState: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (!files) return;
        const fileArray = Array.from(files);
        const imageUrls: string[] = [];
        let filesProcessed = 0;

        // FIX: The type predicate `f is Blob` was invalid because `Blob` is a supertype of `File`, and predicates must narrow types.
        // Changed to `f is File` which is a valid predicate and correctly types the filtered array.
        const blobFiles = fileArray.filter((f): f is File => f instanceof Blob);
        if (blobFiles.length === 0) return;

        blobFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    imageUrls.push(reader.result);
                }
                filesProcessed++;
                if (filesProcessed === blobFiles.length) {
                    setImageState(prev => [...prev, ...imageUrls]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRecognitionFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files, setRecognitionImages);
    };
    
    const handleOriginalPhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(event.target.files, setModalImages);
    };

    const handleSaveRecognition = () => {
        if (recognitionImages.length === 0) return;
        // Simulate API call
        console.log("Saving recognition images:", recognitionImages);
        setSuccessMessage(`Đã lưu thành công ${recognitionImages.length} ảnh nhận diện.`);
        setShowSuccessModal(true);
        setRecognitionImages([]); // Clear after saving
    };
    
    const handleSaveOriginalPhotos = () => {
        if (!selectedTeacher || modalImages.length === 0) return;
        console.log(`Saving ${modalImages.length} photos for ${selectedTeacher.name}`);
        setSuccessMessage(`Đã lưu thành công ${modalImages.length} ảnh cho ${selectedTeacher.name}.`);
        setShowSuccessModal(true);
        handleCloseUploadModal();
    };
    
    const mockCamera = () => {
        alert('Chức năng camera đang được phát triển!');
    };

    const handleOpenLeaveRequestModal = (request: LeaveRequest) => {
        setSelectedLeaveRequest(request);
        setIsLeaveRequestModalOpen(true);
    };

    const handleCloseLeaveRequestModal = () => {
        setIsLeaveRequestModalOpen(false);
        setSelectedLeaveRequest(null);
    };

    const handleApproveRequest = (id: string) => {
        const request = leaveRequests.find(r => r.id === id);
        if (!request) return;

        // 1. Update leave request status
        setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', approvedBy: 'GVCN: Nguyễn Thu An' } : r));

        // 2. Update student's attendance status for that day
        const requestDate = request.leaveDate;
        setCurrentWeekData(prevData => {
            if (!prevData[requestDate]) return prevData;

            const newData = { ...prevData };
            const dayData = { ...newData[requestDate] };

            // Assuming leave is for the whole day, update both sessions
            const updateSession = (session: Student[]) => 
                session.map(student => 
                    student.id === request.studentId ? { ...student, status: 'absent_p' as AttendanceStatus } : student
                );
            
            dayData.am = updateSession(dayData.am);
            dayData.pm = updateSession(dayData.pm);
            
            newData[requestDate] = dayData;
            return newData;
        });

        setSuccessMessage(`Đã duyệt đơn cho học sinh ${request.studentName}.`);
        setShowSuccessModal(true);
    };
    
    const handleDenyRequest = (id: string) => {
        const request = leaveRequests.find(r => r.id === id);
        if (!request) return;
        setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        setSuccessMessage(`Đã từ chối đơn của học sinh ${request.studentName}.`);
        setShowSuccessModal(true);
    };

    
    // Handler for class time changes
    const handleClassTimeChange = (session: 'am' | 'pm', value: string) => {
        setClassTimes(prev => ({ ...prev, [session]: value }));
    };

    // Handler for lesson period changes
    const handlePeriodChange = (session: 'am' | 'pm', index: number, type: 'start' | 'end', value: string) => {
        setLessonPeriods(prev => {
            const newPeriods = [...prev[session]];
            newPeriods[index] = { ...newPeriods[index], [type]: value };
            return { ...prev, [session]: newPeriods };
        });
    };
    
    // Handler for saving time settings
    const handleSaveTimeSettings = () => {
        console.log("Saving time settings:", { classTimes, lessonPeriods });
        setSuccessMessage('Đã lưu thiết lập thời gian thành công!');
        setShowSuccessModal(true);
    };

    const pendingLeaveRequestsCount = leaveRequests.filter(r => r.status === 'pending').length;

    // FIX: Reordered menu items to follow a more logical workflow for teachers.
    const menu = {
        'face-registration': { label: 'Đăng ký khuôn mặt', icon: <FaceIdIcon /> },
        'time-setup': { label: 'Thiết lập Thời gian', icon: <ClockIcon /> },
        'recognition-history': { label: 'Lịch sử nhận diện', icon: <BuildingIcon /> },
        'take-attendance': { label: 'Thực hiện Điểm danh', icon: <UserCheckIcon /> },
        'leave-requests': { label: 'Duyệt đơn nghỉ', icon: <MailIcon />, badge: pendingLeaveRequestsCount },
        'reports': { label: 'Báo cáo / Xuất dữ liệu', icon: <FileTextIcon /> },
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'recognition-history':
                return <RecognitionHistoryView />;
            case 'take-attendance': {
                const weekDates = Array.from({ length: 7 }, (_, i) => addDays(getWeekStart(selectedDay), i));
                const weekStart = weekDates[0];
                const weekEnd = weekDates[6];

                const selectedDateStr = formatDateForID(selectedDay);
                const studentsForSession = currentWeekData[selectedDateStr]?.[selectedSession] ?? [];

                const sortedStudents = [...studentsForSession].sort((a, b) => {
                    if (a.status === 'unrecognized' && b.status !== 'unrecognized') return -1;
                    if (a.status !== 'unrecognized' && b.status === 'unrecognized') return 1;
                    return a.name.localeCompare(b.name, 'vi');
                });

                const isEditable = !isFuture(selectedDay);
                const isEditingPast = isPast(selectedDay);

                const leavesForDay = leaveRequests.filter(req => req.leaveDate === selectedDateStr && req.status !== 'rejected');

                return <>
                    <h2 className="content-title">Thực hiện Điểm danh - Lớp 10A1</h2>

                    <div className="attendance-picker">
                        <div className="week-navigator">
                            <button onClick={() => setSelectedDay(addDays(selectedDay, -7))}><ArrowLeftIcon /></button>
                            <span>{formatDate(weekStart, {day: '2-digit', month: '2-digit'})} - {formatDate(weekEnd, {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                            <button onClick={() => setSelectedDay(addDays(selectedDay, 7))}><ArrowRightIcon /></button>
                        </div>
                        <div className="day-picker">
                            {weekDates.map(day => {
                                const dayStr = formatDateForID(day);
                                return (
                                    <button 
                                        key={dayStr} 
                                        className={`day-button ${dayStr === selectedDateStr ? 'active' : ''}`}
                                        onClick={() => setSelectedDay(day)}
                                    >
                                        <span className="day-name">{formatDate(day, { weekday: 'long' })}</span>
                                        <span className="day-number">{formatDate(day, { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="session-picker">
                            <button className={`session-button ${selectedSession === 'am' ? 'active' : ''}`} onClick={() => setSelectedSession('am')}>Sáng</button>
                            <button className={`session-button ${selectedSession === 'pm' ? 'active' : ''}`} onClick={() => setSelectedSession('pm')}>Chiều</button>
                        </div>
                    </div>

                    <div className="content-grid">
                        <div className="card">
                            <h3>Danh sách học sinh - {formatDate(selectedDay, { weekday: 'long' })}, Buổi {selectedSession === 'am' ? 'Sáng' : 'Chiều'}</h3>
                            {/* FIX: Added instructional message for teachers to handle unrecognized students. */}
                            <div className="info-message instruction">
                                <InfoIcon />
                                <span>Lưu ý: Đối với các học sinh 'Chưa nhận diện', giáo viên cần xác nhận và cập nhật lại trạng thái thủ công.</span>
                            </div>
                            {sortedStudents.length > 0 ? (
                                <ul className="student-list interactive">
                                    {sortedStudents.map(student => (
                                        <li key={student.id}>
                                            <span className="student-name">{student.name}</span>
                                            <div className="status-and-actions">
                                                <div className="status-buttons">
                                                    {(Object.keys(statusOptions) as AttendanceStatus[]).map(statusKey => (
                                                        <button 
                                                            key={statusKey}
                                                            onClick={() => handleStatusChange(student.id, statusKey)}
                                                            className={`status-button status-${statusKey} ${student.status === statusKey ? 'active' : ''}`}
                                                            title={statusOptions[statusKey]}
                                                            disabled={!isEditable}
                                                        >
                                                            {statusOptions[statusKey]}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-data-message">Không có danh sách học sinh cho buổi này.</p>
                            )}
                        </div>
                        <div className="card">
                            <h3>Thao tác</h3>
                            <button className="action-button primary" disabled={!isEditable} onClick={handleSaveClick}>Lưu / Xác nhận điểm danh</button>
                            
                            {!isEditable && (
                                <div className="sub-section info-message readonly">
                                    <p><strong>Không thể thực hiện:</strong> Không thể điểm danh cho một ngày trong tương lai.</p>
                                </div>
                            )}
                            {isEditingPast && (
                                <div className="sub-section info-message warning">
                                    <p><strong>Lưu ý:</strong> Bạn đang sửa điểm danh cho một ngày trong quá khứ. Mọi thay đổi sẽ yêu cầu giải trình khi lưu.</p>
                                </div>
                            )}
                            
                            <div className="sub-section">
                                <h4>Đơn xin nghỉ ({leavesForDay.length})</h4>
                                {leavesForDay.length > 0 ? (
                                    <ul className="leave-request-list">
                                        {leavesForDay.map(req => (
                                            <li key={req.id}>
                                                <span>{req.studentName}</span>
                                                <button className="view-leave-button-secondary" onClick={() => handleOpenLeaveRequestModal(req)}>
                                                    <EyeIcon /> Xem đơn
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Không có đơn xin nghỉ nào cho ngày này.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>;
            }
            case 'face-registration': {
                 const filteredTeachers = mockTeacherFaceData.filter(teacher => 
                    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    teacher.teacherId.includes(searchTerm)
                 );
                 const trainingStatusText: Record<TrainingStatus, string> = {
                    trained: 'Đã train',
                    not_trained: 'Chưa train',
                    training: 'Đang train'
                 };

                 return <>
                    <div className={faceRegTab === 'recognition' ? 'face-reg-header-dark' : ''}>
                        <h2 className="content-title">Đăng ký khuôn mặt</h2>
                        <div className="tab-nav">
                            <button 
                                className={faceRegTab === 'original' ? 'active' : ''} 
                                onClick={() => setFaceRegTab('original')}
                            >
                                Up ảnh gốc học sinh/ giáo viên
                            </button>
                            <button 
                                className={faceRegTab === 'recognition' ? 'active' : ''} 
                                onClick={() => setFaceRegTab('recognition')}
                            >
                                Upload ảnh xác nhận
                            </button>
                        </div>
                    </div>
                    <div className="tab-content">
                        {faceRegTab === 'original' && (
                            <div className="face-management-container">
                                <div className="search-bar-container">
                                   <input 
                                        type="text" 
                                        placeholder="Tìm kiếm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                   />
                                   <SearchIcon />
                                </div>
                                <div className="teacher-table-wrapper">
                                    <table className="teacher-table">
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Thao tác</th>
                                                <th>Tên giáo viên</th>
                                                <th>Số lượng ảnh</th>
                                                <th>Mã giáo viên</th>
                                                <th>Trạng thái AI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTeachers.map(teacher => (
                                                <tr key={teacher.stt}>
                                                    <td>{teacher.stt}</td>
                                                    <td className="action-cell">
                                                        <button className="table-button upload" onClick={() => handleOpenUploadModal(teacher)}>
                                                            <ImageIcon/> Tải ảnh
                                                        </button>
                                                        <button className="table-button history"><HistoryIcon/> Lịch sử</button>
                                                    </td>
                                                    <td>{teacher.name}</td>
                                                    <td>
                                                        <span className={`photo-count count-${teacher.photoCount > 0 ? 'positive' : 'zero'}`}>
                                                            {teacher.photoCount}
                                                        </span>
                                                    </td>
                                                    <td>{teacher.teacherId}</td>
                                                    <td>
                                                        {teacher.trainingStatus === 'training' ? (
                                                            <AiTrainingStatusWidget />
                                                        ) : (
                                                            <span className={`training-status ${teacher.trainingStatus}`}>
                                                                {trainingStatusText[teacher.trainingStatus]}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {faceRegTab === 'recognition' && (
                           <div className="rec-upload-panels">
                                <div className="rec-panel">
                                    <div className="rec-panel-header">
                                        <CameraIcon />
                                        <span>Chụp Ảnh / Tải Lên</span>
                                    </div>
                                    <div className="rec-panel-body">
                                        <input
                                            type="file"
                                            ref={recognitionFileInputRef}
                                            onChange={handleRecognitionFileChange}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                            multiple
                                        />
                                        <button className="rec-btn camera" onClick={mockCamera}>
                                            <VideoCameraIcon /> Bật Camera
                                        </button>
                                        <button className="rec-btn upload" onClick={handleRecognitionUploadClick}>
                                            <UploadIcon /> Tải Ảnh
                                        </button>
                                    </div>
                                </div>
                                <div className="rec-panel">
                                    <div className="rec-panel-header">
                                        <UsersIcon />
                                        <span>Danh sách nhận diện ({recognitionImages.length})</span>
                                    </div>
                                    <div className="rec-panel-body scrollable">
                                        {recognitionImages.length === 0 ? (
                                            <div className="rec-placeholder">
                                                <ImageIcon />
                                                <p>Chụp ảnh hoặc tải lên để bắt đầu nhận diện</p>
                                            </div>
                                        ) : (
                                            <div className="rec-results-grid">
                                                {recognitionImages.map((imgSrc, index) => (
                                                    <img key={index} src={imgSrc} alt={`Recognition preview ${index + 1}`} className="rec-image-preview" />
                                                ))}
                                            </div>
                                        )}
                                         {recognitionImages.length > 0 && (
                                            <button className="action-button primary" style={{width: '100%', marginTop: 'auto'}} onClick={handleSaveRecognition}>
                                                Lưu & Nhận diện
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                 </>;
            }
            case 'leave-requests': {
                const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
                const processedRequests = leaveRequests.filter(r => r.status !== 'pending');
                const statusText: Record<LeaveRequestStatus, string> = {
                    pending: 'Chờ duyệt',
                    approved: 'Đã Duyệt',
                    rejected: 'Bị Từ Chối',
                };
                
                return (
                    <div className="leave-approval-container">
                        <h2 className="content-title">Duyệt đơn xin nghỉ</h2>
                        {/* FIX: Added sub-tabs to separate pending and processed leave requests. */}
                        <div className="sub-tab-nav">
                            <button 
                                className={`sub-tab-button ${leaveRequestSubTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setLeaveRequestSubTab('pending')}
                            >
                                Đang chờ duyệt ({pendingRequests.length})
                            </button>
                            <button 
                                className={`sub-tab-button ${leaveRequestSubTab === 'processed' ? 'active' : ''}`}
                                onClick={() => setLeaveRequestSubTab('processed')}
                            >
                                Đã xử lý ({processedRequests.length})
                            </button>
                        </div>

                        {leaveRequestSubTab === 'pending' && (
                            <>
                                {pendingRequests.length > 0 ? (
                                    <div className="leave-requests-grid">
                                        {pendingRequests.map(req => (
                                            <div key={req.id} className="leave-card">
                                                <div className="leave-card-header">
                                                    <div>
                                                        <p className="student-name">{req.studentName}</p>
                                                        <p className="parent-name">PH: {req.parentName}</p>
                                                    </div>
                                                    <div className="leave-date">
                                                        <span>Ngày nghỉ: <strong>{formatDate(new Date(req.leaveDate.replace(/-/g, '/')))}</strong></span>
                                                    </div>
                                                </div>
                                                <p className="leave-reason">{req.reason}</p>
                                                <div className="leave-card-actions">
                                                    <button className="action-button deny" onClick={() => handleDenyRequest(req.id)}>
                                                        <XCircleIcon /> Từ chối
                                                    </button>
                                                    <button className="action-button primary approve" onClick={() => handleApproveRequest(req.id)}>
                                                        <CheckCircleIcon /> Duyệt
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data-message">Không có đơn nào đang chờ duyệt.</p>
                                )}
                            </>
                        )}
                        
                        {/* FIX: Added a new view for processed requests, displaying them as a list of styled buttons. */}
                        {leaveRequestSubTab === 'processed' && (
                             <>
                                {processedRequests.length > 0 ? (
                                    <div className="processed-leave-buttons">
                                        {processedRequests.map(req => (
                                            <button key={req.id} className={`processed-leave-btn status-${req.status}`} onClick={() => handleOpenLeaveRequestModal(req)}>
                                                <span className='student-name'>{req.studentName}</span>
                                                <span className='leave-date'>{formatDate(new Date(req.leaveDate.replace(/-/g, '/')), { day: '2-digit', month: '2-digit'})}</span>
                                                <span className={`status-text`}>{statusText[req.status]}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data-message">Chưa có đơn nào được xử lý.</p>
                                )}
                            </>
                        )}
                    </div>
                );
            }
            case 'time-setup': {
                return (
                    <div className="time-setup-container">
                        <div className="time-setup-header">
                            <h2 className="content-title">Thiết lập Thời gian</h2>
                            <button className="action-button primary" onClick={handleSaveTimeSettings}>Lưu thay đổi</button>
                        </div>
                        <div className="time-setup-grid">
                            <div className="card">
                                <h3>Thời gian vào lớp</h3>
                                <p className="card-description">Cài đặt thời gian bắt đầu buổi học để hệ thống ghi nhận các trường hợp đi muộn.</p>
                                <div className="form-group">
                                    <label htmlFor="am-entry-time">Buổi Sáng</label>
                                    <input 
                                        type="time" 
                                        id="am-entry-time"
                                        value={classTimes.am}
                                        onChange={(e) => handleClassTimeChange('am', e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="pm-entry-time">Buổi Chiều</label>
                                    <input 
                                        type="time" 
                                        id="pm-entry-time"
                                        value={classTimes.pm}
                                        onChange={(e) => handleClassTimeChange('pm', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="card large-card">
                                <h3>Thời gian các tiết học</h3>
                                <p className="card-description">Khai báo thời gian bắt đầu và kết thúc cho từng tiết học.</p>
                                <div className="periods-grid">
                                    <div className="session-periods am">
                                        <h4>Buổi Sáng</h4>
                                        {lessonPeriods.am.map((period, index) => (
                                            <div className="period-row" key={`am-${index}`}>
                                                <label>Tiết {index + 1}</label>
                                                <div className="period-inputs">
                                                    <input 
                                                        type="time" 
                                                        value={period.start}
                                                        onChange={(e) => handlePeriodChange('am', index, 'start', e.target.value)}
                                                    />
                                                    <span>-</span>
                                                    <input 
                                                        type="time" 
                                                        value={period.end}
                                                        onChange={(e) => handlePeriodChange('am', index, 'end', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="session-periods pm">
                                        <h4>Buổi Chiều</h4>
                                        {lessonPeriods.pm.map((period, index) => (
                                            <div className="period-row" key={`pm-${index}`}>
                                                <label>Tiết {index + 1}</label>
                                                <div className="period-inputs">
                                                    <input 
                                                        type="time" 
                                                        value={period.start}
                                                        onChange={(e) => handlePeriodChange('pm', index, 'start', e.target.value)}
                                                    />
                                                    <span>-</span>
                                                    <input 
                                                        type="time" 
                                                        value={period.end}
                                                        onChange={(e) => handlePeriodChange('pm', index, 'end', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
             case 'reports': {
                const studentsForToday = currentWeekData[formatDateForID(new Date())]?.am ?? []; 
                
                const stats = {
                    total: studentsForToday.length,
                    present: studentsForToday.filter(s => s.status === 'present').length,
                    late: studentsForToday.filter(s => s.status === 'late').length,
                    absent_p: studentsForToday.filter(s => s.status === 'absent_p').length,
                    absent_np: studentsForToday.filter(s => s.status === 'absent_np').length,
                    unrecognized: studentsForToday.filter(s => s.status === 'unrecognized').length,
                };
                const totalAbsent = stats.absent_p + stats.absent_np;

                const chartData = [
                    { label: 'Có mặt', value: stats.present, color: 'var(--status-present)' },
                    { label: 'Đi muộn', value: stats.late, color: 'var(--status-late)' },
                    { label: 'Vắng CP', value: stats.absent_p, color: 'var(--status-absent_p)' },
                    { label: 'Vắng KP', value: stats.absent_np, color: 'var(--status-absent_np)' },
                    { label: 'Chưa DD', value: stats.unrecognized, color: 'var(--status-unrecognized)' },
                ];
                const maxChartValue = Math.max(...chartData.map(d => d.value), 1); 

                const studentsToFilter = studentsForToday.filter(student =>
                    student.name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                    student.id.toLowerCase().includes(reportSearchTerm.toLowerCase())
                );
                
                const filteredStudents = [...studentsToFilter].sort((a, b) => {
                    if (a.status === 'unrecognized' && b.status !== 'unrecognized') return -1;
                    if (a.status !== 'unrecognized' && b.status === 'unrecognized') return 1;
                    return a.name.localeCompare(b.name, 'vi');
                });
                
                const handleExport = () => {
                    if (filteredStudents.length === 0) {
                        alert('Không có dữ liệu để xuất.');
                        return;
                    }
            
                    const headers = ['STT', 'Họ và tên', 'Mã HS', 'Trạng thái'];
                    const csvContent = [
                        headers.join(','),
                        ...filteredStudents.map((student, index) => [
                            index + 1,
                            `"${student.name}"`,
                            student.id,
                            statusOptions[student.status]
                        ].join(','))
                    ].join('\n');
            
                    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    const todayStr = new Date().toISOString().slice(0, 10);
                    link.setAttribute('download', `Bao_cao_diem_danh_${todayStr}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };


                return (
                    <div className="reports-container">
                        <h2 className="content-title">Báo cáo và Thống kê</h2>
                        
                        <div className="reports-header">
                             <div className="filter-group">
                                <label htmlFor="report-type">Xem theo</label>
                                <select id="report-type" className="filter-select" value={reportType} onChange={e => setReportType(e.target.value)}>
                                    <option value="day">Ngày</option>
                                    <option value="week">Tuần</option>
                                    <option value="month">Tháng</option>
                                    <option value="semester">Học kỳ</option>
                                    <option value="year">Năm học</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                {reportType === 'day' && <input type="date" value={reportValue} onChange={e => setReportValue(e.target.value)} />}
                                {reportType === 'week' && <input type="week" />}
                                {reportType === 'month' && <input type="month" />}
                                {reportType === 'semester' && (
                                    <select className="filter-select">
                                        <option>Học kỳ I</option>
                                        <option>Học kỳ II</option>
                                    </select>
                                )}
                                {reportType === 'year' && (
                                    <select className="filter-select">
                                        <option>2024-2025</option>
                                        <option>2023-2024</option>
                                    </select>
                                )}
                            </div>
                            <div className="filter-group student-search">
                                <input type="text" id="student-search" placeholder="Tìm theo tên hoặc mã HS..." value={reportSearchTerm} onChange={e => setReportSearchTerm(e.target.value)} />
                                <SearchIcon/>
                            </div>
                            <button className="export-button" onClick={handleExport}>
                                <DownloadIcon /> Xuất Excel/PDF
                            </button>
                        </div>

                        <div className="report-stats-grid">
                            <div className="report-stat-card">
                                <div className="stat-value">{stats.total}</div>
                                <div className="stat-label">Sĩ số</div>
                            </div>
                            <div className="report-stat-card present">
                                <div className="stat-value">{stats.present}</div>
                                <div className="stat-label">Có mặt</div>
                            </div>
                            <div className="report-stat-card late">
                                <div className="stat-value">{stats.late}</div>
                                <div className="stat-label">Đi muộn</div>
                            </div>
                            <div className="report-stat-card absent">
                                <div className="stat-value">{totalAbsent}</div>
                                <div className="stat-label">Vắng</div>
                            </div>
                            <div className="report-stat-card absent-np">
                                <div className="stat-value">{stats.absent_np}</div>
                                <div className="stat-label">Vắng không phép</div>
                            </div>
                        </div>

                        <div className="report-content-grid">
                            <div className="report-chart-container card">
                                <h3>Biểu đồ điểm danh ngày {formatDate(new Date())}</h3>
                                <div className="chart">
                                    <div className="chart-y-axis">
                                        <span>{maxChartValue}</span>
                                        <span>{Math.round(maxChartValue / 2)}</span>
                                        <span>0</span>
                                    </div>
                                    <div className="chart-bars">
                                        {chartData.map(item => (
                                            <div key={item.label} className="chart-bar-group">
                                                <div 
                                                    className="chart-bar" 
                                                    style={{ 
                                                        height: `${(item.value / maxChartValue) * 100}%`,
                                                        backgroundColor: item.color 
                                                    }}
                                                    title={`${item.label}: ${item.value}`}
                                                >
                                                    <span className="bar-value">{item.value}</span>
                                                </div>
                                                <div className="bar-label">{item.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="report-table-container card">
                                <h3>Bảng chi tiết điểm danh</h3>
                                <div className="table-wrapper-scroll">
                                    <table className="report-table">
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Họ và tên</th>
                                                <th>Mã HS</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student, index) => (
                                                <tr key={student.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{student.name}</td>
                                                    <td>{student.id}</td>
                                                    <td>
                                                        <span className={`status-badge status-${student.status}`}>
                                                            {statusOptions[student.status]}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
            default:
                return <div className="card"><p>Nội dung cho mục "{menu[activeTab]?.label}" đang được xây dựng.</p></div>;
        }
    }
    
    return (
        <Dashboard role="Giáo viên" onBack={onBack} onOpenWorkflow={onOpenWorkflow} onOpenTestCases={onOpenTestCases} notifications={mockNotifications}>
            <div className="dashboard-layout">
                <nav className="sidebar">
                    {/* FIX: Destructuring `badge` was causing a type error as it's not present on all menu items. The map now iterates over the `item` object and uses a type guard to safely access the optional `badge` property. */}
                    {Object.entries(menu).map(([key, item]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`sidebar-item ${activeTab === key ? 'active' : ''}`}>
                            {item.icon} 
                            <span>{item.label}</span>
                            {'badge' in item && item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
                        </button>
                    ))}
                </nav>
                <main className={`main-content ${activeTab === 'recognition-history' ? 'alt-bg' : ''} ${faceRegTab === 'recognition' && activeTab === 'face-registration' ? 'recognition-bg' : ''}`}>{renderContent()}</main>
            </div>
             <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Giải trình lý do sửa điểm danh"
                footer={
                    <>
                        <button className="action-button" onClick={handleCloseModal}>Hủy</button>
                        <button className="action-button primary" onClick={handleConfirmSaveWithReason} disabled={!changeReason.trim()}>Xác nhận và Lưu</button>
                    </>
                }
            >
                <div className="change-reason-form">
                    <p>
                        Bạn đang lưu các thay đổi điểm danh cho ngày {formatDate(selectedDay, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Vui lòng cung cấp lý do cho những thay đổi này.
                    </p>
                    <div className="form-group">
                        <label htmlFor="change-reason">Lý do giải trình:</label>
                        <textarea 
                            id="change-reason" 
                            rows={4} 
                            value={changeReason}
                            onChange={(e) => setChangeReason(e.target.value)}
                            placeholder="Ví dụ: Cập nhật theo đơn xin phép của phụ huynh, sửa lỗi nhập nhầm..."
                        />
                    </div>
                </div>
            </Modal>
             <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Thông báo"
                footer={
                    <button 
                        className="action-button primary" 
                        onClick={() => setShowSuccessModal(false)}
                    >
                        Đóng
                    </button>
                }
            >
                <p style={{textAlign: 'center'}}>{successMessage}</p>
            </Modal>
            {isUploadModalOpen && selectedTeacher && (
                <div className="modal-overlay" onClick={handleCloseUploadModal}>
                    <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header purple">
                            <h3>Ảnh khuôn mặt - {selectedTeacher.name}</h3>
                            <button onClick={handleCloseUploadModal} className="close-button">&times;</button>
                        </div>
                        <div className="modal-body upload-modal-body">
                             <input
                                type="file"
                                ref={originalPhotoInputRef}
                                onChange={handleOriginalPhotoFileChange}
                                style={{ display: 'none' }}
                                accept="image/*"
                                multiple
                            />
                             {selectedTeacher.requiresPhotoUpdate && (
                                <div className="update-required-alert">
                                    <WarningIcon />
                                    <div>
                                        <h4>Yêu cầu cập nhật ảnh</h4>
                                        <p>Hình ảnh cũ không đạt chất lượng nhận diện, vui lòng cập nhật ảnh chân dung sắc nét, rõ khuôn mặt.</p>
                                    </div>
                                </div>
                             )}
                            <div className="upload-card">
                                <p>Thêm hoặc xóa ảnh khuôn mặt học sinh. Các thay đổi sẽ được lưu trực tiếp.</p>
                                <div className="student-info-grid">
                                    <div>
                                        <label>Mã học sinh:</label>
                                        <span>{selectedTeacher.teacherId}</span>
                                    </div>
                                    <div>
                                        <label>Họ và tên:</label>
                                        <span>{selectedTeacher.name}</span>
                                    </div>
                                </div>
                            </div>

                             <div className="upload-card">
                                <div className="section-header">
                                    <h4>Ảnh hiện có ({selectedTeacher.photoCount + modalImages.length} ảnh)</h4>
                                    <span>Tối đa 5 ảnh cho mỗi học sinh.</span>
                                </div>
                                {selectedTeacher.photoCount === 0 && modalImages.length === 0 ? (
                                    <div className="photo-grid-placeholder">
                                         <ImageIcon />
                                        <p>Chưa có ảnh nào cho học sinh này.</p>
                                    </div>
                                ) : (
                                    <div className="rec-results-grid">
                                        {/* Placeholder for existing images */}
                                        {modalImages.map((imgSrc, index) => (
                                            <img key={index} src={imgSrc} alt={`New preview ${index + 1}`} className="rec-image-preview" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="upload-card">
                                <h4>Thêm ảnh khuôn mặt</h4>
                                <div className="add-photo-buttons">
                                    <button className="add-photo-btn" onClick={mockCamera}><CameraIcon /> Chụp ảnh</button>
                                    <button className="add-photo-btn" onClick={handleOriginalPhotoUploadClick}><UploadIcon /> Chọn ảnh</button>
                                </div>
                                <p className="info-text">
                                    <InfoIcon />
                                    <span>Bạn có thể chọn nhiều ảnh cùng lúc. Mỗi ảnh tối đa 10MB. Hỗ trợ định dạng: JPG, PNG, GIF, WEBP</span>
                                </p>
                                <div className="instructions-section">
                                    <div className="instructions-header">
                                      <InfoIcon />
                                      <div>
                                        <h5>Hướng dẫn chụp ảnh khuôn mặt</h5>
                                        <p>Chụp ảnh chính diện để đạt độ chính xác cao nhất</p>
                                      </div>
                                    </div>
                                    <div className="instructions-body">
                                       <FaceOutlineIcon />
                                       <p>Nhìn thẳng vào camera, khuôn mặt rõ ràng và đủ ánh sáng</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                           <button className="action-button" onClick={handleCloseUploadModal}>Hủy</button>
                           <button className="action-button primary" onClick={handleSaveOriginalPhotos} disabled={modalImages.length === 0}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
            <Modal
                isOpen={isLeaveRequestModalOpen}
                onClose={handleCloseLeaveRequestModal}
                title="Chi tiết Đơn xin nghỉ"
                footer={<>
                    {selectedLeaveRequest?.status === 'pending' && (
                        <>
                            <button className="action-button deny" onClick={() => { if(selectedLeaveRequest) { handleDenyRequest(selectedLeaveRequest.id); handleCloseLeaveRequestModal(); }}}>
                                <XCircleIcon /> Từ chối
                            </button>
                            <button className="action-button primary approve" onClick={() => { if(selectedLeaveRequest) { handleApproveRequest(selectedLeaveRequest.id); handleCloseLeaveRequestModal(); }}}>
                                <CheckCircleIcon /> Duyệt
                            </button>
                        </>
                    )}
                    <button className="action-button" onClick={handleCloseLeaveRequestModal}>
                       {selectedLeaveRequest?.status === 'pending' ? 'Để sau' : 'Đóng'}
                    </button>
                </>}
            >
                {selectedLeaveRequest && (
                    <div className="leave-request-details">
                        <div className="detail-item">
                            <span className="detail-label">Học sinh:</span>
                            <span className="detail-value">{selectedLeaveRequest.studentName}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Phụ huynh:</span>
                            <span className="detail-value">{selectedLeaveRequest.parentName}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Ngày nghỉ:</span>
                            <span className="detail-value">{formatDate(new Date(selectedLeaveRequest.leaveDate.replace(/-/g, '/')))}</span>
                        </div>
                         <div className="detail-item">
                            <span className="detail-label">Lý do:</span>
                            <p className="detail-value reason">{selectedLeaveRequest.reason}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </Dashboard>
    );
};

const ParentView = ({ onBack, onOpenWorkflow, onOpenTestCases }: { onBack: () => void; onOpenWorkflow: () => void; onOpenTestCases: () => void; }) => {
    const [activeTab, setActiveTab] = useState('today');
    const [reportType, setReportType] = useState('month');

    // --- Student-specific data ---
    const studentId = 'HS002';
    const studentName = 'Trần Thị Bình';
    const relevantNotifications = mockNotifications.filter(n => !n.studentId || n.studentId === studentId);
    
    const menu = {
        'today': { label: 'Điểm danh hôm nay', icon: <UserCheckIcon /> },
        'leave-request': { label: 'Đơn xin nghỉ', icon: <MailIcon /> },
        'reports': { label: 'Báo cáo', icon: <FileTextIcon /> },
    };

     const renderContent = () => {
        switch(activeTab) {
            case 'today': {
                const todayRecord = mockHistoryData.find(h => h.date === formatDateForID(today));
                // Check current session or default to AM
                const currentHour = new Date().getHours();
                const session: 'am' | 'pm' = currentHour < 12 ? 'am' : 'pm';
                let studentTodayStatus: Student | undefined;
                if (todayRecord) {
                    studentTodayStatus = todayRecord.sessions[session].find(s => s.id === studentId);
                } else {
                    // Fallback to the live data if history isn't populated for today yet
                    studentTodayStatus = mockStudentsData.find(s => s.id === studentId)
                }
                
                return <div className="card">
                    <h3>Trạng thái điểm danh hôm nay ({studentName})</h3>
                    {studentTodayStatus ? (
                         <p className={`status-highlight status-${studentTodayStatus.status}`}>
                            {statusOptions[studentTodayStatus.status]}
                        </p>
                    ) : (
                        <p className="status-highlight status-unrecognized">Chưa có dữ liệu</p>
                    )}
                    <p><strong>Ghi chú từ giáo viên:</strong> Không có.</p>
                </div>;
            }
            case 'leave-request': {
                const studentLeaveRequests = mockLeaveRequestsData.filter(req => req.studentId === studentId);
                const statusText: Record<LeaveRequestStatus, string> = {
                    pending: 'Chờ duyệt',
                    approved: 'Đã duyệt',
                    rejected: 'Bị từ chối',
                };

                 return <div className="card">
                    <h3>Gửi đơn xin nghỉ</h3>
                    <form className="leave-form">
                        <div className="form-group">
                            <label htmlFor="leave-date">Ngày nghỉ</label>
                            <input type="date" id="leave-date" defaultValue={formatDateForID(new Date())}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="leave-reason">Lý do</label>
                            <textarea id="leave-reason" rows={4} placeholder="Vui lòng nêu rõ lý do..."></textarea>
                        </div>
                        <button type="submit" className="action-button primary">Gửi đơn</button>
                    </form>
                    <div className="sub-section">
                        <h4>Lịch sử đơn xin nghỉ</h4>
                        {studentLeaveRequests.length > 0 ? (
                             <ul className="student-list compact">
                                {studentLeaveRequests.map((req) => (
                                    <li key={req.id}>
                                        <span>Đơn ngày: {formatDate(new Date(req.leaveDate.replace(/-/g, '/')), { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                        <span className={`status-badge status-${req.status}`}>{statusText[req.status]}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Chưa có đơn nào được gửi.</p>
                        )}
                    </div>
                 </div>;
            }
            case 'reports': {
                const reportData: Array<{date: string, session: string, status: AttendanceStatus}> = [];
                mockHistoryData.forEach(record => {
                    const am_status = record.sessions.am.find(s => s.id === studentId)?.status;
                    if(am_status) reportData.push({ date: record.date, session: 'Sáng', status: am_status });
                    const pm_status = record.sessions.pm.find(s => s.id === studentId)?.status;
                    if(pm_status) reportData.push({ date: record.date, session: 'Chiều', status: pm_status });
                });


                const stats = {
                    totalSessions: reportData.length,
                    presentSessions: reportData.filter(r => r.status === 'present').length,
                    absentSessions: reportData.filter(r => r.status.startsWith('absent')).length,
                };

                return (
                    <div className="reports-container">
                        <h2 className="content-title">Báo cáo chuyên cần - {studentName}</h2>
        
                        <div className="reports-header">
                            <div className="filter-group">
                                <label htmlFor="parent-report-type">Xem theo</label>
                                <select id="parent-report-type" className="filter-select" value={reportType} onChange={e => setReportType(e.target.value)}>
                                    <option value="week">Tuần</option>
                                    <option value="month">Tháng</option>
                                    <option value="semester">Học kỳ</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                {reportType === 'week' && <input type="week" />}
                                {reportType === 'month' && <input type="month" />}
                                {reportType === 'semester' && (
                                    <select className="filter-select">
                                        <option>Học kỳ I</option>
                                        <option>Học kỳ II</option>
                                    </select>
                                )}
                            </div>
                            <button className="export-button">
                                <DownloadIcon /> Xuất Báo cáo
                            </button>
                        </div>
        
                        <div className="report-stats-grid">
                            <div className="report-stat-card">
                                <div className="stat-value">{stats.totalSessions}</div>
                                <div className="stat-label">Tổng số buổi học</div>
                            </div>
                            <div className="report-stat-card present">
                                <div className="stat-value">{stats.presentSessions}</div>
                                <div className="stat-label">Số buổi có mặt</div>
                            </div>
                            <div className="report-stat-card absent">
                                <div className="stat-value">{stats.absentSessions}</div>
                                <div className="stat-label">Số buổi vắng</div>
                            </div>
                        </div>
        
                        <div className="card" style={{ marginTop: '24px' }}>
                            <h3>Chi tiết điểm danh</h3>
                            <div className="table-wrapper-scroll">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Ngày</th>
                                            <th>Buổi</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((record, index) => (
                                            <tr key={index}>
                                                <td>{formatDate(new Date(record.date.replace(/-/g, '/')), { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                                <td>{record.session}</td>
                                                <td>
                                                    <span className={`status-badge status-${record.status}`}>
                                                        {statusOptions[record.status as AttendanceStatus]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            }
            default:
                return <div className="card"><p>Nội dung cho mục "{menu[activeTab]?.label}" đang được xây dựng.</p></div>;
        }
    }

    return (
        <Dashboard role="Phụ huynh" onBack={onBack} onOpenWorkflow={onOpenWorkflow} onOpenTestCases={onOpenTestCases} notifications={relevantNotifications}>
             <div className="dashboard-layout">
                <nav className="sidebar">
                    {Object.entries(menu).map(([key, {label, icon}]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`sidebar-item ${activeTab === key ? 'active' : ''}`}>
                            {icon} <span>{label}</span>
                        </button>
                    ))}
                </nav>
                <main className="main-content">{renderContent()}</main>
            </div>
        </Dashboard>
    );
};

const StudentView = ({ onBack, onOpenWorkflow, onOpenTestCases }: { onBack: () => void; onOpenWorkflow: () => void; onOpenTestCases: () => void; }) => {
    const [activeTab, setActiveTab] = useState('today');
    const [reportType, setReportType] = useState('month');

    // --- Student-specific data ---
    const studentId = 'HS002';
    const studentName = 'Trần Thị Bình';
    const relevantNotifications = mockNotifications.filter(n => !n.studentId || n.studentId === studentId);
    
    const menu = {
        'today': { label: 'Điểm danh hôm nay', icon: <UserCheckIcon /> },
        'notifications': { label: 'Thông báo', icon: <BellIcon /> },
        'reports': { label: 'Báo cáo', icon: <FileTextIcon /> },
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'today': {
                 const todayRecord = mockHistoryData.find(h => h.date === formatDateForID(today));
                const currentHour = new Date().getHours();
                const session: 'am' | 'pm' = currentHour < 12 ? 'am' : 'pm';
                let studentTodayStatus: Student | undefined;
                if (todayRecord) {
                    studentTodayStatus = todayRecord.sessions[session].find(s => s.id === studentId);
                } else {
                    studentTodayStatus = mockStudentsData.find(s => s.id === studentId)
                }
                
                return <div className="card">
                    <h3>Trạng thái điểm danh hôm nay của bạn</h3>
                    {studentTodayStatus ? (
                         <p className={`status-highlight status-${studentTodayStatus.status}`}>
                            {statusOptions[studentTodayStatus.status]}
                        </p>
                    ) : (
                        <p className="status-highlight status-unrecognized">Chưa có dữ liệu</p>
                    )}
                </div>;
            }
            case 'notifications': {
                const getIconForType = (type: 'warning' | 'info') => {
                    switch (type) {
                        case 'warning': return <WarningIcon />;
                        case 'info': return <InfoIcon />;
                        default: return null;
                    }
                };

                 return <div className="card">
                    <h3>Thông báo của bạn</h3>
                     <ul className="notification-list full-page">
                        {relevantNotifications.length > 0 ? relevantNotifications.map(notif => (
                            <li key={notif.id} className={`notification-item ${notif.read ? 'read' : ''}`}>
                                <div className={`notification-icon icon-${notif.type}`}>
                                    {getIconForType(notif.type)}
                                </div>
                                <div className="notification-content">
                                    <p className="notification-title">{notif.title}</p>
                                    <p className="notification-message">{notif.message}</p>
                                    <p className="notification-timestamp">{notif.timestamp}</p>
                                </div>
                            </li>
                        )) : <li className="notification-empty">Bạn không có thông báo nào.</li>}
                    </ul>
                 </div>;
            }
            case 'reports': {
                const reportData: Array<{date: string, session: string, status: AttendanceStatus}> = [];
                mockHistoryData.forEach(record => {
                    const am_status = record.sessions.am.find(s => s.id === studentId)?.status;
                    if(am_status) reportData.push({ date: record.date, session: 'Sáng', status: am_status });
                    const pm_status = record.sessions.pm.find(s => s.id === studentId)?.status;
                    if(pm_status) reportData.push({ date: record.date, session: 'Chiều', status: pm_status });
                });


                const stats = {
                    totalSessions: reportData.length,
                    presentSessions: reportData.filter(r => r.status === 'present').length,
                    absentSessions: reportData.filter(r => r.status.startsWith('absent')).length,
                };

                return (
                    <div className="reports-container">
                        <h2 className="content-title">Báo cáo chuyên cần của bạn</h2>
        
                        <div className="reports-header">
                            <div className="filter-group">
                                <label htmlFor="student-report-type">Xem theo</label>
                                <select id="student-report-type" className="filter-select" value={reportType} onChange={e => setReportType(e.target.value)}>
                                    <option value="week">Tuần</option>
                                    <option value="month">Tháng</option>
                                    <option value="semester">Học kỳ</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                {reportType === 'week' && <input type="week" />}
                                {reportType === 'month' && <input type="month" />}
                                {reportType === 'semester' && (
                                    <select className="filter-select">
                                        <option>Học kỳ I</option>
                                        <option>Học kỳ II</option>
                                    </select>
                                )}
                            </div>
                            <button className="export-button">
                                <DownloadIcon /> Xuất Báo cáo
                            </button>
                        </div>
        
                        <div className="report-stats-grid">
                            <div className="report-stat-card">
                                <div className="stat-value">{stats.totalSessions}</div>
                                <div className="stat-label">Tổng số buổi học</div>
                            </div>
                            <div className="report-stat-card present">
                                <div className="stat-value">{stats.presentSessions}</div>
                                <div className="stat-label">Số buổi có mặt</div>
                            </div>
                            <div className="report-stat-card absent">
                                <div className="stat-value">{stats.absentSessions}</div>
                                <div className="stat-label">Số buổi vắng</div>
                            </div>
                        </div>
        
                        <div className="card" style={{ marginTop: '24px' }}>
                            <h3>Chi tiết điểm danh</h3>
                            <div className="table-wrapper-scroll">
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Ngày</th>
                                            <th>Buổi</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((record, index) => (
                                            <tr key={index}>
                                                <td>{formatDate(new Date(record.date.replace(/-/g, '/')), { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                                <td>{record.session}</td>
                                                <td>
                                                    <span className={`status-badge status-${record.status}`}>
                                                        {statusOptions[record.status as AttendanceStatus]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            }
            default:
                return <div className="card"><p>Nội dung cho mục "{menu[activeTab]?.label}" đang được xây dựng.</p></div>;
        }
    }

    return (
        <Dashboard role="Học sinh" onBack={onBack} onOpenWorkflow={onOpenWorkflow} onOpenTestCases={onOpenTestCases} notifications={relevantNotifications}>
            <div className="dashboard-layout">
                <nav className="sidebar">
                    {Object.entries(menu).map(([key, {label, icon}]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`sidebar-item ${activeTab === key ? 'active' : ''}`}>
                           {icon} <span>{label}</span>
                        </button>
                    ))}
                </nav>
                <main className="main-content">{renderContent()}</main>
            </div>
        </Dashboard>
    );
};


// --- WORKFLOW MODAL ---
const workflowData = {
    teacher: {
        title: "Giáo viên",
        icon: <BriefcaseIcon/>,
        description: "Vai trò quản lý & thực thi, tập trung vào việc vận hành và kiểm soát dữ liệu.",
        steps: [
            { icon: <ClockIcon/>, title: "1. Thiết lập thời gian học", tasks: ["Vào Thiết lập thời gian học, khai báo thời gian và tiết học cho lớp.", "Lưu thông tin làm căn cứ điểm danh."] },
            { icon: <FaceIdIcon/>, title: "2. Đăng ký khuôn mặt học sinh", tasks: ["Vào Đăng ký khuôn mặt.", "Tải ảnh gốc học sinh (rõ mặt, chính diện). (Chờ 24h để AI ghi nhớ dữ liệu)", "Chụp hoặc tải thêm 1 ảnh để xác nhận.", "Hệ thống tự động học dữ liệu khuôn mặt."] },
            { icon: <VideoCameraIcon/>, title: "3. Điểm danh bằng camera", tasks: ["Học sinh đi qua khu vực camera khi đến trường.", "Hệ thống tự động nhận diện và ghi nhận điểm danh.", "Kết quả được gửi thông báo đến phụ huynh.", "Nhận diện sau giờ vào lớp sẽ được ghi nhận là đi trễ."] },
            { icon: <UserCheckIcon/>, title: "4. Kiểm tra và xử lý điểm danh", tasks: ["Kiểm tra tại Lịch sử nhận diện (toàn trường) hoặc Thực hiện điểm danh (theo lớp).", "Trường hợp chưa nhận diện:", "  • Bổ sung ảnh tại Đăng ký khuôn mặt.", "  • Kiểm tra đơn xin nghỉ của phụ huynh.", "  • Điểm danh thủ công tại Thực hiện điểm danh.", "Xác nhận và lưu kết quả."] },
            { icon: <FileTextIcon/>, title: "5. Báo cáo và xuất dữ liệu", tasks: ["Vào Báo cáo / Xuất dữ liệu.", "Xem thống kê, ghi nhận đi trễ.", "Xuất file Excel hoặc PDF."] },
            { icon: <UploadIcon/>, title: "6. Đồng bộ dữ liệu", tasks: ["Kiểm tra kỹ trước khi lưu điểm danh", "Admin tiến hành đồng bộ dữ liệu lên cơ sở dữ liệu ngành."] }
        ]
    },
    parent: {
        title: "Phụ huynh",
        icon: <UsersIcon/>,
        description: "Vai trò giám sát & phối hợp, theo dõi sát sao tình hình đi học của con.",
        steps: [
            { icon: <UserCheckIcon/>, title: "1. Theo dõi điểm danh", tasks: ["Vào Điểm danh → Báo cáo chuyên cần.", "Xem trạng thái có mặt, vắng mặt, đi trễ."] },
            { icon: <MailIcon/>, title: "2. Xin nghỉ học", tasks: ["Vào Điểm danh → Làm đơn xin phép.", "Gửi đơn xin nghỉ.", "Chờ giáo viên kiểm tra và xác nhận."] }
        ]
    },
    student: {
        title: "Học sinh",
        icon: <UserIcon/>,
        description: "Vai trò thực hiện & nhận thông tin, là đối tượng trung tâm của việc điểm danh.",
        steps: [
            { icon: <FaceIdIcon/>, title: "1. Thực hiện điểm danh", tasks: ["Đi qua camera và nhìn thẳng vào camera vài giây.", "Không cần thao tác khác.", "Nếu chưa được nhận diện, giáo viên sẽ hỗ trợ."] },
            { icon: <HistoryIcon/>, title: "2. Xem kết quả điểm danh", tasks: ["Xem tại mục Báo cáo chuyên cần trên ứng dụng."] }
        ]
    }
}

const WorkflowModalContent = () => {
    const [activeRole, setActiveRole] = useState<keyof typeof workflowData>('teacher');
    
    const activeWorkflow = workflowData[activeRole];

    return (
        <div className="workflow-container">
            <div className="workflow-tabs">
                {(['teacher', 'student', 'parent'] as (keyof typeof workflowData)[]).map(role => (
                    <button 
                        key={role} 
                        className={`workflow-tab-button ${activeRole === role ? 'active' : ''}`}
                        onClick={() => setActiveRole(role)}
                    >
                        {workflowData[role].icon}
                        <span>{workflowData[role].title}</span>
                    </button>
                ))}
            </div>

            <div className="workflow-content">
                <p className="workflow-role-description">{activeWorkflow.description}</p>
                <div className="workflow-steps">
                    {activeWorkflow.steps.map((step, index) => (
                        <div key={index} className="workflow-step">
                            <div className="workflow-step-header">
                                <div className="workflow-step-icon">{step.icon}</div>
                                <h5 className="workflow-step-title">{step.title}</h5>
                            </div>
                            <div className="workflow-step-body">
                                <ul>
                                    {step.tasks.map((task, taskIndex) => (
                                        <li key={taskIndex}>{task}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- TEST CASE MODAL ---
type TestCaseStatus = 'untested' | 'pass' | 'fail';
type Priority = 'Cao' | 'Trung bình' | 'Thấp';

interface TestCase {
    id: string;
    feature: string;
    name: string;
    steps: string[];
    expected: string;
    priority: Priority;
    status: TestCaseStatus;
}

interface TestGroup {
    role: string;
    cases: TestCase[];
}

const newInitialTestCasesData: TestGroup[] = [
  {
    role: "Giáo viên",
    cases: [
      { id: 'TC-GV-01', feature: 'Thiết lập', name: 'Đăng ký khuôn mặt mới', steps: ['Chọn học sinh', 'Upload/Chụp ảnh nhận diện', 'Nhấn Lưu'], expected: 'Hệ thống báo thành công, ảnh hiển thị đúng tại hồ sơ HS', priority: 'Cao', status: 'untested' },
      { id: 'TC-GV-02', feature: 'Thực hiện', name: 'Điểm danh thủ công', steps: ['Chọn học sinh vắng mặt', 'Chỉnh trạng thái thành "Có mặt"', 'Lưu xác nhận'], expected: 'Trạng thái cập nhật tức thì, có ghi chú "GV xác nhận"', priority: 'Cao', status: 'untested' },
      { id: 'TC-GV-04', feature: 'Báo cáo', name: 'Xuất báo cáo đi làm', steps: ['Chọn thời gian', 'Nhấn "Xuất dữ liệu"'], expected: 'File Excel tải về đúng định dạng, đủ số ngày công của GV', priority: 'Trung bình', status: 'untested' },
      { id: 'TC-GV-05', feature: 'Báo cáo', name: 'Xuất báo cáo học sinh', steps: ['Chọn lớp/học sinh', 'Nhấn "Xuất báo cáo"'], expected: 'Hiển thị đủ: Tỷ lệ chuyên cần, số buổi vắng, đi muộn', priority: 'Cao', status: 'untested' },
    ]
  },
  {
    role: "Phụ huynh",
    cases: [
      { id: 'TC-PH-01', feature: 'Theo dõi', name: 'Nhận thông báo điểm danh', steps: ['Học sinh quét mặt thành công'], expected: 'Notification đẩy về điện thoại PH ngay lập tức', priority: 'Cao', status: 'untested' },
      { id: 'TC-PH-02', feature: 'Tương tác', name: 'Gửi đơn xin nghỉ', steps: ['Chọn ngày/Lý do nghỉ', 'Nhấn Gửi'], expected: 'Đơn được gửi thành công, giáo viên nhận được thông báo', priority: 'Trung bình', status: 'untested' },
      { id: 'TC-PH-03', feature: 'Báo cáo', name: 'Xem lịch sử chuyên cần', steps: ['Vào Lịch sử điểm danh theo tháng'], expected: 'Hiển thị dạng lịch màu trực quan (Xanh: Đủ, Đỏ: Vắng)', priority: 'Trung bình', status: 'untested' },
    ]
  },
  {
    role: "Học sinh",
    cases: [
      { id: 'TC-HS-01', feature: 'Thực hiện', name: 'Điểm danh AI', steps: ['Đứng trước camera nhận diện'], expected: 'Nhận diện đúng ID < 2s, hiển thị lời chào/thông báo', priority: 'Cao', status: 'untested' },
      { id: 'TC-HS-02', feature: 'Báo cáo', name: 'Xem số tiết vắng mặt', steps: ['Vào mục Báo cáo cá nhân'], expected: 'Hiển thị chính xác số tiết vắng/tổng số tiết học', priority: 'Trung bình', status: 'untested' },
    ]
  },
  {
    role: "Hệ thống (Trường hợp ngoại lệ)",
    cases: [
      { id: 'TC-EX-01', feature: 'Ngoại lệ', name: 'Điểm danh khi mất mạng', steps: ['Ngắt kết nối internet', 'Thực hiện quét mặt'], expected: 'Báo "Đã lưu offline", tự đồng bộ khi có mạng lại', priority: 'Cao', status: 'untested' },
      { id: 'TC-EX-02', feature: 'Ngoại lệ', name: 'Chặn nhận diện bằng ảnh chụp', steps: ['Đưa ảnh chân dung HS lên camera'], expected: 'Hệ thống từ chối điểm danh (Liveness Detection)', priority: 'Cao', status: 'untested' },
      { id: 'TC-EX-03', feature: 'Ngoại lệ', name: 'Xung đột Đơn nghỉ & Có mặt', steps: ['PH gửi đơn nghỉ', 'HS vẫn đến trường quét mặt'], expected: 'Ưu tiên dữ liệu quét mặt thực tế, báo cho GV kiểm tra', priority: 'Thấp', status: 'untested' },
      { id: 'TC-EX-04', feature: 'Ngoại lệ', name: 'Sai lệch múi giờ', steps: ['Đổi giờ điện thoại sai thực tế', 'Điểm danh'], expected: 'Dữ liệu ghi nhận theo giờ Server của nhà trường', priority: 'Trung bình', status: 'untested' },
    ]
  }
];

const TestCaseModalContent = () => {
    const [testData, setTestData] = useState<TestGroup[]>(newInitialTestCasesData);

    const handleStatusChange = (groupIndex: number, caseIndex: number, newStatus: TestCaseStatus) => {
        const newData = [...testData];
        const currentStatus = newData[groupIndex].cases[caseIndex].status;
        // If clicking the same status button, toggle it back to 'untested'
        newData[groupIndex].cases[caseIndex].status = currentStatus === newStatus ? 'untested' : newStatus;
        setTestData(newData);
    };

    const getPriorityClass = (priority: Priority) => {
        switch (priority) {
            case 'Cao': return 'priority-cao';
            case 'Trung bình': return 'priority-trungbinh';
            case 'Thấp': return 'priority-thap';
            default: return '';
        }
    };

    return (
        <div className="test-case-container">
            {testData.map((group, groupIndex) => (
                <div key={group.role} className="test-case-section">
                    <h4>{group.role}</h4>
                    <table className="test-case-table">
                        <thead>
                            <tr>
                                <th>Mã Case</th>
                                <th>Tính năng</th>
                                <th>Tên kịch bản</th>
                                <th>Các bước thực hiện</th>
                                <th>Kết quả mong đợi</th>
                                <th>Ưu tiên</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {group.cases.map((tc, caseIndex) => (
                                <tr key={tc.id}>
                                    <td>{tc.id}</td>
                                    <td>{tc.feature}</td>
                                    <td>{tc.name}</td>
                                    <td>
                                        <ul className="steps-list">
                                            {tc.steps.map((step, i) => <li key={i}>{step}</li>)}
                                        </ul>
                                    </td>
                                    <td>{tc.expected}</td>
                                    <td>
                                        <span className={`priority-badge ${getPriorityClass(tc.priority)}`}>
                                            {tc.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="status-toggle-buttons">
                                            <button 
                                                className={`pass-button ${tc.status === 'pass' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(groupIndex, caseIndex, 'pass')}
                                            >
                                                Pass
                                            </button>
                                            <button 
                                                className={`fail-button ${tc.status === 'fail' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange(groupIndex, caseIndex, 'fail')}
                                            >
                                                Fail
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

const HeadTeacherView = ({ onBack, onOpenWorkflow, onOpenTestCases }: { onBack: () => void; onOpenWorkflow: () => void; onOpenTestCases: () => void; }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequestsData);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [leaveRequestSubTab, setLeaveRequestSubTab] = useState('pending');

    const handleApproveRequest = (id: string) => {
        const request = leaveRequests.find(r => r.id === id);
        if (!request) return;
        setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', approvedBy: 'Tổ trưởng: Hoàng Anh' } : r));
        setSuccessMessage(`Đã duyệt đơn cho học sinh ${request.studentName}.`);
        setShowSuccessModal(true);
    };
    
    const handleDenyRequest = (id: string) => {
        const request = leaveRequests.find(r => r.id === id);
        if (!request) return;
        setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        setSuccessMessage(`Đã từ chối đơn của học sinh ${request.studentName}.`);
        setShowSuccessModal(true);
    };


    const menu = {
        'overview': { label: 'Báo cáo tổng quan', icon: <GridIcon /> },
        'leave-requests': { label: 'Quản lý đơn nghỉ', icon: <MailIcon /> },
    };

    const overviewData = [
        { id: '10A1', size: 40, attendance: 95, pending: 2 },
        { id: '10A2', size: 38, attendance: 98, pending: 0 },
        { id: '10A3', size: 41, attendance: 92, pending: 5 },
    ];
    const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
    const processedRequests = leaveRequests.filter(r => r.status !== 'pending');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="card">
                        <h3>Báo cáo tổng quan các lớp phụ trách</h3>
                        <div className="table-wrapper-scroll">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Lớp</th>
                                        <th>Sĩ số</th>
                                        <th>Tỉ lệ chuyên cần</th>
                                        <th>Đơn nghỉ chờ duyệt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overviewData.map(cls => (
                                        <tr key={cls.id}>
                                            <td>{cls.id}</td>
                                            <td>{cls.size}</td>
                                            <td>{cls.attendance}%</td>
                                            <td>{cls.pending}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'leave-requests':
                 return (
                    <div className="leave-approval-container">
                        <h2 className="content-title">Quản lý đơn nghỉ</h2>
                        <div className="sub-tab-nav">
                            <button
                                className={`sub-tab-button ${leaveRequestSubTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setLeaveRequestSubTab('pending')}
                            >
                                Đang chờ duyệt ({pendingRequests.length})
                            </button>
                            <button
                                className={`sub-tab-button ${leaveRequestSubTab === 'processed' ? 'active' : ''}`}
                                onClick={() => setLeaveRequestSubTab('processed')}
                            >
                                Đã xử lý ({processedRequests.length})
                            </button>
                        </div>

                        {leaveRequestSubTab === 'pending' && (
                             <>
                                {pendingRequests.length > 0 ? (
                                    <div className="leave-requests-grid">
                                        {pendingRequests.map(req => (
                                            <div key={req.id} className="leave-card">
                                                <div className="leave-card-header">
                                                    <div>
                                                        <p className="student-name">{req.studentName} (Lớp 10A1)</p>
                                                        <p className="parent-name">PH: {req.parentName}</p>
                                                    </div>
                                                    <div className="leave-date">
                                                        <span>Ngày nghỉ: <strong>{formatDate(new Date(req.leaveDate.replace(/-/g, '/')))}</strong></span>
                                                    </div>
                                                </div>
                                                <p className="leave-reason">{req.reason}</p>
                                                <div className="leave-card-actions">
                                                    <button className="action-button deny" onClick={() => handleDenyRequest(req.id)}>
                                                        <XCircleIcon /> Từ chối
                                                    </button>
                                                    <button className="action-button primary approve" onClick={() => handleApproveRequest(req.id)}>
                                                        <CheckCircleIcon /> Duyệt
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data-message">Không có đơn nào đang chờ duyệt.</p>
                                )}
                             </>
                        )}
                        {leaveRequestSubTab === 'processed' && (
                            <>
                                {processedRequests.length > 0 ? (
                                    <div className="leave-requests-grid">
                                        {processedRequests.map(req => (
                                            <div key={req.id} className={`leave-card processed status-${req.status}`}>
                                                <div className="leave-card-header">
                                                    <div>
                                                        <p className="student-name">{req.studentName} (Lớp 10A1)</p>
                                                        <p className="parent-name">PH: {req.parentName}</p>
                                                    </div>
                                                    <div className="leave-date">
                                                        <span>Ngày nghỉ: <strong>{formatDate(new Date(req.leaveDate.replace(/-/g, '/')))}</strong></span>
                                                    </div>
                                                </div>
                                                <p className="leave-reason small">{req.reason}</p>
                                                <div className="leave-card-footer">
                                                    {req.status === 'approved' && req.approvedBy && (
                                                        <div className="approver-info">
                                                            <CheckCircleIcon />
                                                            <span>Duyệt bởi: <strong>{req.approvedBy}</strong></span>
                                                        </div>
                                                    )}
                                                    {req.status === 'rejected' && (
                                                        <div className="approver-info rejected">
                                                            <XCircleIcon />
                                                            <span>Bị từ chối</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data-message">Chưa có đơn nào được xử lý.</p>
                                )}
                            </>
                        )}
                    </div>
                );
            default: return null;
        }
    }
    
    return (
        <Dashboard role="Tổ trưởng" onBack={onBack} onOpenWorkflow={onOpenWorkflow} onOpenTestCases={onOpenTestCases} notifications={mockNotifications}>
            <div className="dashboard-layout">
                <nav className="sidebar">
                    {Object.entries(menu).map(([key, {label, icon}]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`sidebar-item ${activeTab === key ? 'active' : ''}`}>
                            {icon} <span>{label}</span>
                        </button>
                    ))}
                </nav>
                <main className="main-content">{renderContent()}</main>
            </div>
            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Thông báo"
                footer={<button className="action-button primary" onClick={() => setShowSuccessModal(false)}>Đóng</button>}
            >
                <p style={{textAlign: 'center'}}>{successMessage}</p>
            </Modal>
        </Dashboard>
    );
};

const PrincipalView = ({ onBack, onOpenWorkflow, onOpenTestCases }: { onBack: () => void; onOpenWorkflow: () => void; onOpenTestCases: () => void; }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [leaveRequestSubTab, setLeaveRequestSubTab] = useState('pending');
    
    const menu = {
        'overview': { label: 'Báo cáo toàn trường', icon: <BuildingIcon /> },
        'leave-requests': { label: 'Tình hình đơn nghỉ', icon: <MailIcon /> },
    };

    const overviewData = [
        { id: '10', name: 'Khối 10', size: 120, attendance: 96, pending: 7 },
        { id: '11', name: 'Khối 11', size: 115, attendance: 98, pending: 3 },
        { id: '12', name: 'Khối 12', size: 110, attendance: 97, pending: 1 },
    ];
    
    const allLeaveRequests = mockLeaveRequestsData;
    const pendingRequests = allLeaveRequests.filter(r => r.status === 'pending');
    const processedRequests = allLeaveRequests.filter(r => r.status !== 'pending');


    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="card">
                        <h3>Báo cáo chuyên cần toàn trường</h3>
                         <div className="table-wrapper-scroll">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Khối lớp</th>
                                        <th>Tổng sĩ số</th>
                                        <th>Tỉ lệ chuyên cần</th>
                                        <th>Đơn nghỉ chờ duyệt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overviewData.map(grade => (
                                        <tr key={grade.id}>
                                            <td>{grade.name}</td>
                                            <td>{grade.size}</td>
                                            <td>{grade.attendance}%</td>
                                            <td>{grade.pending}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'leave-requests':
                return (
                    <div className="leave-approval-container">
                        <h2 className="content-title">Tình hình đơn nghỉ toàn trường</h2>
                        <div className="sub-tab-nav">
                            <button
                                className={`sub-tab-button ${leaveRequestSubTab === 'pending' ? 'active' : ''}`}
                                onClick={() => setLeaveRequestSubTab('pending')}
                            >
                                Đang chờ duyệt ({pendingRequests.length})
                            </button>
                            <button
                                className={`sub-tab-button ${leaveRequestSubTab === 'processed' ? 'active' : ''}`}
                                onClick={() => setLeaveRequestSubTab('processed')}
                            >
                                Đã xử lý ({processedRequests.length})
                            </button>
                        </div>
        
                        {leaveRequestSubTab === 'pending' && (
                            <>
                                {pendingRequests.length > 0 ? (
                                    <div className="leave-requests-grid">
                                        {pendingRequests.map(req => (
                                             <div key={req.id} className="leave-card">
                                             <div className="leave-card-header">
                                                 <div>
                                                     <p className="student-name">{req.studentName} (Lớp ...)</p>
                                                     <p className="parent-name">PH: {req.parentName}</p>
                                                 </div>
                                                 <div className="leave-date">
                                                     <span>Ngày nghỉ: <strong>{formatDate(new Date(req.leaveDate.replace(/-/g, '/')))}</strong></span>
                                                 </div>
                                             </div>
                                             <p className="leave-reason">{req.reason}</p>
                                         </div>
                                        ))}
                                    </div>
                                ) : (
                                     <p className="no-data-message">Không có đơn nào đang chờ duyệt.</p>
                                )}
                            </>
                        )}
                        
                        {leaveRequestSubTab === 'processed' && (
                            <>
                                {processedRequests.length > 0 ? (
                                    <div className="leave-requests-grid">
                                        {processedRequests.map(req => (
                                            <div key={req.id} className={`leave-card processed status-${req.status}`}>
                                                <div className="leave-card-header">
                                                    <div>
                                                        <p className="student-name">{req.studentName} (Lớp ...)</p>
                                                        <p className="parent-name">PH: {req.parentName}</p>
                                                    </div>
                                                    <div className="leave-date">
                                                        <span>Ngày nghỉ: <strong>{formatDate(new Date(req.leaveDate.replace(/-/g, '/')))}</strong></span>
                                                    </div>
                                                </div>
                                                <p className="leave-reason small">{req.reason}</p>
                                                <div className="leave-card-footer">
                                                    {req.status === 'approved' && req.approvedBy && (
                                                        <div className="approver-info">
                                                            <CheckCircleIcon />
                                                            <span>Duyệt bởi: <strong>{req.approvedBy}</strong></span>
                                                        </div>
                                                    )}
                                                    {req.status === 'rejected' && (
                                                        <div className="approver-info rejected">
                                                            <XCircleIcon />
                                                            <span>Bị từ chối</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data-message">Chưa có đơn nào được xử lý.</p>
                                )}
                            </>
                        )}
                    </div>
                );
            default: return null;
        }
    }
    
    return (
        <Dashboard role="Ban Giám hiệu" onBack={onBack} onOpenWorkflow={onOpenWorkflow} onOpenTestCases={onOpenTestCases} notifications={mockNotifications}>
            <div className="dashboard-layout">
                <nav className="sidebar">
                    {Object.entries(menu).map(([key, {label, icon}]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`sidebar-item ${activeTab === key ? 'active' : ''}`}>
                            {icon} <span>{label}</span>
                        </button>
                    ))}
                </nav>
                <main className="main-content">{renderContent()}</main>
            </div>
        </Dashboard>
    );
};


// --- MAIN APP ---

function App() {
  const [view, setView] = useState<View>('landing');
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setView(role);
  };

  const handleBackToRoleSelection = () => {
    setView('role-selection');
  }

  const openTestCases = () => setIsTestCaseModalOpen(true);

  const renderContent = () => {
    switch (view) {
      case 'teacher':
        return <TeacherView onBack={handleBackToRoleSelection} onOpenWorkflow={() => setIsWorkflowModalOpen(true)} onOpenTestCases={openTestCases} />;
      case 'parent':
        return <ParentView onBack={handleBackToRoleSelection} onOpenWorkflow={() => setIsWorkflowModalOpen(true)} onOpenTestCases={openTestCases} />;
      case 'student':
        return <StudentView onBack={handleBackToRoleSelection} onOpenWorkflow={() => setIsWorkflowModalOpen(true)} onOpenTestCases={openTestCases} />;
      case 'head_teacher':
        return <HeadTeacherView onBack={handleBackToRoleSelection} onOpenWorkflow={() => setIsWorkflowModalOpen(true)} onOpenTestCases={openTestCases} />;
      case 'principal':
        return <PrincipalView onBack={handleBackToRoleSelection} onOpenWorkflow={() => setIsWorkflowModalOpen(true)} onOpenTestCases={openTestCases} />;
      case 'role-selection':
        return (
          <div className="role-selection-container">
            <h1 className="dramatic-title">Chọn vai trò của bạn</h1>
            <div className="role-cards-grid">
                <div className="role-card" onClick={() => handleRoleSelect('teacher')}>
                    <BriefcaseIcon />
                    <h2>Giáo viên</h2>
                    <p>Quản lý điểm danh, đăng ký khuôn mặt, xem báo cáo.</p>
                </div>
                <div className="role-card" onClick={() => handleRoleSelect('parent')}>
                    <UsersIcon />
                    <h2>Phụ huynh</h2>
                    <p>Theo dõi lịch sử điểm danh, gửi đơn xin nghỉ phép.</p>
                </div>
                <div className="role-card" onClick={() => handleRoleSelect('student')}>
                    <UserIcon />
                    <h2>Học sinh</h2>
                    <p>Xem trạng thái điểm danh và lịch sử cá nhân.</p>
                </div>
                <div className="role-card" onClick={() => handleRoleSelect('head_teacher')}>
                    <UsersGroupIcon />
                    <h2>Tổ trưởng</h2>
                    <p>Tổng quan các lớp phụ trách, duyệt đơn nghỉ cấp tổ.</p>
                </div>
                 <div className="role-card" onClick={() => handleRoleSelect('principal')}>
                    <BuildingIcon />
                    <h2>Ban Giám hiệu</h2>
                    <p>Báo cáo toàn trường, theo dõi tình hình chuyên cần.</p>
                </div>
            </div>
          </div>
        );
      case 'landing':
      default:
        return (
            <div className="landing-container">
                <h1 className="dramatic-title">Module Điểm Danh</h1>
                <p className="subtitle">Hệ thống điểm danh thông minh</p>
                <button className="primary-button" onClick={() => setView('role-selection')}>
                    Truy cập
                    <ChevronRightIcon />
                </button>
            </div>
        );
    }
  };

  return (
    <>
      <div className="immersive-app">
        <DottedGlowBackground 
          gap={24} 
          radius={1.5} 
          color="rgba(0, 0, 0, 0.04)" 
          glowColor="rgba(60, 120, 255, 0.1)" 
          speedScale={0.5} 
        />
        <div className="content-area">
            {renderContent()}
        </div>
      </div>
      <Modal
            isOpen={isWorkflowModalOpen}
            onClose={() => setIsWorkflowModalOpen(false)}
            title="Quy trình điểm danh"
            className="workflow-modal"
            footer={
                <button
                    className="action-button primary"
                    onClick={() => setIsWorkflowModalOpen(false)}
                >
                    Đã hiểu
                </button>
            }
        >
            <WorkflowModalContent />
        </Modal>
        <Modal
            isOpen={isTestCaseModalOpen}
            onClose={() => setIsTestCaseModalOpen(false)}
            title="Kịch bản Test Case"
            className="test-case-modal"
            footer={
                <button
                    className="action-button primary"
                    onClick={() => setIsTestCaseModalOpen(false)}
                >
                    Đóng
                </button>
            }
        >
            <TestCaseModalContent />
        </Modal>
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
