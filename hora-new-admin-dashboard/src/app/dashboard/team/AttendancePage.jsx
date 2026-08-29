'use client';

import React, { useState, useEffect, useCallback } from 'react';
import "./team.css";
import SearchWithDropDown from '@/app/component/SearchWithDropDown';
import { BASE_URL } from "../../../utils/apiconstant";

const BASE_URL_TEAM = `${BASE_URL}/api/team`;

export default function AttendancePage() {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    const [teamData, setTeamData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [monthDays, setMonthDays] = useState([]);

    const [attendanceMap, setAttendanceMap] = useState({});

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
    const [reasonModalData, setReasonModalData] = useState(null);

    const [leaveForm, setLeaveForm] = useState({
        memberId: '',
        date: '',
        leaveType: 'Full Day',
        halfDayType: 'First Half',
        reason: ''
    });

    const [holidayForm, setHolidayForm] = useState({
        memberId: 'all',
        date: '',
        title: ''
    });

    const normalizeDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const currentDateNormalized = normalizeDate(today);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [teamRes, attendanceRes] = await Promise.all([
                fetch(`${BASE_URL_TEAM}/getAll`),
                fetch(`${BASE_URL_TEAM}/get-monthly?month=${selectedMonth}&year=${selectedYear}`)
            ]);

            if (!teamRes.ok) throw new Error(`Team Fetch Failed: ${teamRes.status}`);

            const teamResult = await teamRes.json();
            const members = Array.isArray(teamResult) ? teamResult : (teamResult.data || []);
            setTeamData(members);

            if (members.length > 0 && !leaveForm.memberId) {
                setLeaveForm(prev => ({ ...prev, memberId: members[0]._id }));
            }

            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            const days = [];
            const initialMap = {};

            members.forEach(member => {
                initialMap[member._id] = {};
            });

            for (let day = 1; day <= daysInMonth; day++) {
                const dateObj = new Date(selectedYear, selectedMonth, day);
                const dateObjNormalized = normalizeDate(dateObj);
                const dayOfWeek = dateObj.getDay();
                const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const isSunday = dayOfWeek === 0;
                const isFuture = dateObjNormalized > currentDateNormalized;

                days.push({ dayNumber: day, dateString, dayName, isSunday, isFuture });

                members.forEach(member => {
                    let defaultStatus = 'Present';
                    if (isFuture) {
                        defaultStatus = '-';
                    }

                    initialMap[member._id][dateString] = {
                        status: defaultStatus,
                        reason: defaultStatus === 'Week Off' ? 'Sunday Week Off' : '-',
                        leaveType: '',
                        halfDayType: ''
                    };
                });
            }

            setMonthDays(days);

            if (attendanceRes.ok) {
                const attendanceResult = await attendanceRes.json();
                const fetchedRecords = attendanceResult.data || [];

                fetchedRecords.forEach(rec => {
                    if (initialMap[rec.memberId] && initialMap[rec.memberId][rec.date]) {
                        initialMap[rec.memberId][rec.date] = {
                            status: rec.status,
                            reason: rec.reason || '-',
                            leaveType: rec.leaveType || '',
                            halfDayType: rec.halfDayType || ''
                        };
                    }
                });
            }

            setAttendanceMap(initialMap);

        } catch (err) {
            console.error("API Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 2. Toggle Status (Present/Absent) via API
    const toggleStatus = async (memberId, dateString, isFuture) => {
        if (isFuture) return;

        const currentObj = attendanceMap[memberId]?.[dateString];
        if (!currentObj) return;

        let nextStatus = 'Present';
        if (currentObj.status === 'Present') nextStatus = 'Absent';
        else if (currentObj.status === 'Absent') nextStatus = 'Present';
        else if (currentObj.status === 'Week Off' || currentObj.status === 'Holiday') nextStatus = 'Present';

        setAttendanceMap(prev => ({
            ...prev,
            [memberId]: {
                ...prev[memberId],
                [dateString]: { ...currentObj, status: nextStatus }
            }
        }));

        try {
            const res = await fetch(`${BASE_URL_TEAM}/mark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId,
                    date: dateString,
                    status: nextStatus
                })
            });

            if (!res.ok) throw new Error('Failed to update status');
        } catch (err) {
            console.error("Toggle Status API Error:", err);
            fetchData();
        }
    };

    const handleApplyLeave = async () => {
        if (!leaveForm.date || !leaveForm.memberId) return;

        let finalStatus = 'Leave';
        let leaveLabel = leaveForm.leaveType;

        if (leaveForm.leaveType === 'Half Day') {
            leaveLabel = `Half Day (${leaveForm.halfDayType})`;
        } else if (leaveForm.leaveType === 'Week Off') {
            finalStatus = 'Week Off';
            leaveLabel = 'Week Off';
        }

        try {
            const res = await fetch(`${BASE_URL_TEAM}/apply-leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: leaveForm.memberId,
                    date: leaveForm.date,
                    status: finalStatus,
                    leaveType: leaveForm.leaveType,
                    halfDayType: leaveForm.leaveType === 'Half Day' ? leaveForm.halfDayType : '',
                    reason: `${leaveLabel}: ${leaveForm.reason || 'No detailed reason provided'}`
                })
            });

            if (!res.ok) throw new Error('Failed to apply leave');

            setIsLeaveModalOpen(false);
            setLeaveForm(prev => ({ ...prev, date: '', reason: '', leaveType: 'Full Day' }));
            fetchData();
        } catch (err) {
            console.error("Apply Leave API Error:", err);
            alert("Failed to apply leave. Please try again.");
        }
    };

    // 4. Declare Holiday (All or Per Employee) via API
    const handleDeclareHoliday = async () => {
        if (!holidayForm.date) return;

        try {
            const res = await fetch(`${BASE_URL_TEAM}/declare-holiday`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: holidayForm.memberId,
                    date: holidayForm.date,
                    title: holidayForm.title || 'Official Festival / Holiday'
                })
            });

            if (!res.ok) throw new Error('Failed to declare holiday');

            setIsHolidayModalOpen(false);
            setHolidayForm({ memberId: 'all', date: '', title: '' });
            fetchData();
        } catch (err) {
            console.error("Declare Holiday API Error:", err);
            alert("Failed to declare holiday. Please try again.");
        }
    };

    const getMemberSummary = (memberId) => {
        const memberRecords = attendanceMap[memberId] || {};
        let present = 0;
        let absent = 0;
        let leave = 0;

        monthDays.forEach(day => {
            const record = memberRecords[day.dateString];
            if (record) {
                if (record.status === 'Present') {
                    present++;
                } else if (record.status === 'Absent') {
                    absent++;
                } else if (record.status === 'Leave') {
                    if (record.leaveType === 'Half Day') {
                        leave += 0.5;
                        present += 0.5;
                    } else {
                        leave += 1;
                    }
                }
            }
        });

        return { present, leave, totalWorking: present + absent + leave };
    };

    const selectedEmployeeForLeave = teamData?.find(
        (member) => member._id === leaveForm.memberId
    );

    const selectedEmployeeForHoliday = holidayForm.memberId === 'all'
        ? null
        : teamData?.find((member) => member._id === holidayForm.memberId);

    const ALL_TEAM_LABEL = "🎉 All Team Members";

    return (
        <div className="attendance-container">
            <div className="attendance-wrapper">

                {/* --- HEADER --- */}
                <div className="attendance-header">
                    <div>
                        <h1 className="attendance-title">Team Attendance Sheet</h1>
                        <p className="attendance-subtitle">Hora Services Team ({teamData.length} Members)</p>
                    </div>

                    <div className="attendance-controls">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="select-input"
                        >
                            {[
                                'January', 'February', 'March', 'April', 'May', 'June',
                                'July', 'August', 'September', 'October', 'November', 'December'
                            ].map((m, idx) => (
                                <option key={idx} value={idx}>{m}</option>
                            ))}
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="select-input"
                        >
                            {[2025, 2026, 2027].map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>

                        <button onClick={() => setIsLeaveModalOpen(true)} className="btn btn-amber" disabled={isLoading}>
                            + Apply Leave / Off
                        </button>

                        <button onClick={() => setIsHolidayModalOpen(true)} className="btn btn-indigo" disabled={isLoading}>
                            + Declare Holiday
                        </button>
                    </div>
                </div>

                {/* --- TABLE CONTENT --- */}
                {isLoading ? (
                    <div className="table-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        Loading Attendance Data...
                    </div>
                ) : error ? (
                    <div className="table-card" style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
                        Failed to load data: {error}
                    </div>
                ) : (
                    <div className="table-card">
                        <div className="table-wrapper">
                            <table className="matrix-table">
                                <thead>
                                    <tr>
                                        <th className="sticky-col">Employee Name</th>
                                        {monthDays.map(day => (
                                            <th key={day.dateString} className={`date-header-cell ${day.isSunday ? 'sunday-header' : ''}`}>
                                                <div className="date-num">{day.dayNumber}</div>
                                                <div className="day-name">{day.dayName}</div>
                                            </th>
                                        ))}
                                        <th className="summary-header summary-present">P</th>
                                        <th className="summary-header summary-leave">Total Leave</th>
                                        <th className="summary-header summary-total">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamData.map(member => {
                                        const summary = getMemberSummary(member._id);

                                        return (
                                            <tr key={member._id}>
                                                <td className="sticky-col emp-cell">
                                                    <div className="emp-title">{member.name?.trim()}</div>
                                                    <div className="emp-phone">{member.number}</div>
                                                </td>

                                                {monthDays.map(day => {
                                                    const record = attendanceMap[member._id]?.[day.dateString] || { status: '-' };
                                                    let badgeClass = "badge badge-present";
                                                    let displayStatus = record.status;

                                                    if (record.status === 'Absent') badgeClass = "badge badge-absent";
                                                    else if (record.status === 'Leave') {
                                                        badgeClass = "badge badge-leave";
                                                        if (record.leaveType === 'Half Day') {
                                                            displayStatus = record.halfDayType === 'First Half' ? '1st Half' : '2nd Half';
                                                        }
                                                    }
                                                    else if (record.status === 'Week Off') badgeClass = "badge badge-sunday";
                                                    else if (record.status === 'Holiday') badgeClass = "badge badge-holiday";
                                                    else if (record.status === '-') badgeClass = "badge badge-future";

                                                    const hasDetails = record.status === 'Leave' || record.status === 'Holiday' || record.status === 'Week Off';

                                                    return (
                                                        <td
                                                            key={day.dateString}
                                                            className={`status-cell ${day.isSunday ? 'sunday-cell' : ''} ${day.isFuture ? 'future-cell' : ''}`}
                                                            onClick={() => toggleStatus(member._id, day.dateString, day.isFuture)}
                                                        >
                                                            <div className="cell-content">
                                                                <span className={badgeClass}>{displayStatus}</span>

                                                                {hasDetails && (
                                                                    <button
                                                                        className="btn-view-reason"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setReasonModalData({
                                                                                memberName: member.name,
                                                                                date: day.dateString,
                                                                                status: record.status,
                                                                                reason: record.reason
                                                                            });
                                                                        }}
                                                                    >
                                                                        View
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}

                                                <td className="summary-cell summary-present">{summary.present}</td>
                                                <td className="summary-cell summary-leave">{summary.leave}</td>
                                                <td className="summary-cell summary-total">{summary.totalWorking}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- MODAL 1: VIEW REASON --- */}
                {reasonModalData && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">{reasonModalData.status} Details</h3>
                                <button onClick={() => setReasonModalData(null)} className="close-btn">✕</button>
                            </div>
                            <div className="modal-body">
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                                    <strong>Employee:</strong> {reasonModalData.memberName}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                                    <strong>Date:</strong> {reasonModalData.date}
                                </p>
                                <div className="reason-box">
                                    <strong>Details / Reason:</strong>
                                    <p style={{ margin: '0.3rem 0 0 0', color: '#1e293b' }}>
                                        {reasonModalData.reason}
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setReasonModalData(null)} className="btn btn-indigo">Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODAL 2: APPLY LEAVE / WEEK OFF --- */}
                {isLeaveModalOpen && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Apply Leave / Week Off</h3>
                                <button onClick={() => setIsLeaveModalOpen(false)} className="close-btn">✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Select Employee</label>

                                    <SearchWithDropDown
                                        options={teamData.map(
                                            (member) => `${member.name?.trim()} (${member.number})`
                                        )}
                                        selectedValue={
                                            selectedEmployeeForLeave
                                                ? `${selectedEmployeeForLeave.name?.trim()} (${selectedEmployeeForLeave.number})`
                                                : ""
                                        }
                                        onChange={(selectedEmployeeText) => {
                                            const member = teamData.find(
                                                (item) =>
                                                    `${item.name?.trim()} (${item.number})` ===
                                                    selectedEmployeeText
                                            );

                                            if (member) {
                                                setLeaveForm(prev => ({
                                                    ...prev,
                                                    memberId: member._id,
                                                }));
                                            }
                                        }}
                                        placeholder="Search Employee..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Select Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={leaveForm.date}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Leave Type / Option</label>
                                    <select
                                        className="input-field"
                                        value={leaveForm.leaveType}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                                    >
                                        <option value="Full Day">Full Day Leave</option>
                                        <option value="Half Day">Half Day Leave</option>
                                        <option value="Week Off">Week Off</option>
                                    </select>
                                </div>

                                {leaveForm.leaveType === 'Half Day' && (
                                    <div className="form-group" style={{ paddingLeft: '1rem', borderLeft: '3px solid #f59e0b', backgroundColor: '#fffbeb', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                                        <label className="form-label" style={{ color: '#b45309' }}>Select Half Day Slot</label>
                                        <select
                                            className="input-field"
                                            value={leaveForm.halfDayType}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, halfDayType: e.target.value })}
                                        >
                                            <option value="First Half">First Half</option>
                                            <option value="Second Half">Second Half</option>
                                        </select>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Reason</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe reason for leave or off..."
                                        className="input-field textarea-field"
                                        value={leaveForm.reason}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setIsLeaveModalOpen(false)} className="btn-cancel">Cancel</button>
                                <button onClick={handleApplyLeave} className="btn btn-amber">Submit Record</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- MODAL 3: DECLARE HOLIDAY --- */}
                {isHolidayModalOpen && (
                    <div className="modal-backdrop">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Declare Holiday / Festival</h3>
                                <button onClick={() => setIsHolidayModalOpen(false)} className="close-btn">✕</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Apply Holiday For</label>

                                    <SearchWithDropDown
                                        options={[
                                            ALL_TEAM_LABEL,
                                            ...teamData.map(
                                                (member) => `${member.name?.trim()} (${member.number})`
                                            )
                                        ]}
                                        selectedValue={
                                            holidayForm.memberId === 'all'
                                                ? ALL_TEAM_LABEL
                                                : selectedEmployeeForHoliday
                                                    ? `${selectedEmployeeForHoliday.name?.trim()} (${selectedEmployeeForHoliday.number})`
                                                    : ALL_TEAM_LABEL
                                        }
                                        onChange={(selectedText) => {
                                            if (selectedText === ALL_TEAM_LABEL) {
                                                setHolidayForm(prev => ({
                                                    ...prev,
                                                    memberId: 'all'
                                                }));
                                            } else {
                                                const member = teamData.find(
                                                    (item) =>
                                                        `${item.name?.trim()} (${item.number})` === selectedText
                                                );

                                                if (member) {
                                                    setHolidayForm(prev => ({
                                                        ...prev,
                                                        memberId: member._id
                                                    }));
                                                }
                                            }
                                        }}
                                        placeholder="Search Employee or Select All..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Holiday Date</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={holidayForm.date}
                                        onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Holiday Title / Festival</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Diwali, Festival, Comp Off"
                                        className="input-field"
                                        value={holidayForm.title}
                                        onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button onClick={() => setIsHolidayModalOpen(false)} className="btn-cancel">Cancel</button>
                                <button onClick={handleDeclareHoliday} className="btn btn-indigo">Save Holiday</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}