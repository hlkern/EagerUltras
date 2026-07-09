package org.eagerultras.controller;

import lombok.RequiredArgsConstructor;
import org.eagerultras.response.DashboardHighlightsResponse;
import org.eagerultras.response.NotificationResponse;
import org.eagerultras.response.StadiumResponse;
import org.eagerultras.service.DashboardService;
import org.eagerultras.service.NotificationService;
import org.eagerultras.service.UserStadiumService;
import org.eagerultras.service.UserWishlistService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserStadiumService userStadiumService;
    private final UserWishlistService userWishlistService;
    private final DashboardService dashboardService;
    private final NotificationService notificationService;

    @GetMapping("/{userId}/stadiums")
    public List<StadiumResponse> getVisitedStadiums(@PathVariable Long userId) {
        return userStadiumService.getVisitedStadiums(userId);
    }

    @GetMapping("/{userId}/wishlist")
    public List<StadiumResponse> getWishlist(@PathVariable Long userId) {
        return userWishlistService.getWishlist(userId);
    }

    @GetMapping("/{userId}/dashboard-highlights")
    public DashboardHighlightsResponse getDashboardHighlights(@PathVariable Long userId) {
        return dashboardService.getHighlights(userId);
    }

    @GetMapping("/{userId}/notifications")
    public List<NotificationResponse> getNotifications(@PathVariable Long userId,
                                                       @org.springframework.web.bind.annotation.RequestParam(defaultValue = "false") boolean unreadOnly) {
        return notificationService.listNotifications(userId, unreadOnly);
    }

    @org.springframework.web.bind.annotation.PostMapping("/{userId}/notifications/mark-seen")
    public void markNotificationsAsSeen(@PathVariable Long userId) {
        notificationService.markAllAsSeen(userId);
    }
}
