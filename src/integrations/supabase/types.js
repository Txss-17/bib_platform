const Constants = {
  public: {
    Enums: {
      boutique_status: ["draft", "published"],
      issue_action: ["accept", "refuse", "partial_refund", "resend", "other"],
      issue_status: ["pending", "accepted", "refused", "resolved", "escalated"],
      issue_type: ["not_received", "return_request", "defective"],
      logistics_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "returned"
      ],
      member_status: ["pending", "active", "removed"],
      moq_status: ["reserved", "confirmed", "expired", "cancelled"],
      payment_status: ["pending", "completed", "failed"],
      plan_tier: ["starter", "growth", "pro"],
      product_status: ["active", "paused"],
      recycling_source: ["qr_scan", "manual", "pickup"],
      rotation_indicator: ["green", "yellow", "orange", "red"],
      scene_event_type: [
        "impression",
        "cta_click",
        "dwell",
        "scroll_depth",
        "conversion"
      ],
      storefront_event_type: [
        "boutique_view",
        "product_view",
        "add_to_cart",
        "checkout_start"
      ],
      support_ticket_source: ["dashboard_ai", "dashboard_form", "storefront"],
      support_ticket_status: ["open", "in_progress", "resolved", "closed"],
      team_role: ["owner", "manager", "marketing", "support"]
    }
  }
};
export {
  Constants
};
