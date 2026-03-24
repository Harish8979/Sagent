package com.ticketbooking.service;

import com.ticketbooking.dto.admin.AdminCancelShowtimeRequestDto;
import com.ticketbooking.dto.admin.AdminCreateUserRequestDto;
import com.ticketbooking.dto.admin.AdminCreateShowtimeRequestDto;
import com.ticketbooking.dto.admin.AdminDashboardDto;
import com.ticketbooking.dto.admin.AdminRemoveEventRequestDto;
import com.ticketbooking.dto.admin.AdminSendTestEmailRequestDto;
import com.ticketbooking.dto.admin.AdminShowtimeSummaryDto;
import com.ticketbooking.dto.admin.AdminUpdateUserRequestDto;
import com.ticketbooking.dto.admin.AdminUserSummaryDto;

public interface AdminService {

    AdminDashboardDto getDashboard();

    AdminShowtimeSummaryDto createShowtime(AdminCreateShowtimeRequestDto request);

    void cancelShowtime(Long showtimeId, AdminCancelShowtimeRequestDto request);

    void removeEvent(Long eventId, AdminRemoveEventRequestDto request);

    void sendTestEmail(AdminSendTestEmailRequestDto request);

    AdminUserSummaryDto createUser(AdminCreateUserRequestDto request, Long adminUserId);

    AdminUserSummaryDto updateUser(Long userId, AdminUpdateUserRequestDto request, Long adminUserId);

    void deleteUser(Long userId, Long adminUserId);
}
