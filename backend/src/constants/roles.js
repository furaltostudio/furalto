const USER_ROLES = {
  CUSTOMER: "customer",
  STAFF: "staff",
  ADMIN: "admin",
};

const STAFF_ROLES = [USER_ROLES.STAFF, USER_ROLES.ADMIN];

module.exports = {
  USER_ROLES,
  STAFF_ROLES,
};
