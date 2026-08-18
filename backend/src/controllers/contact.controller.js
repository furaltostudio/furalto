const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const contactService = require("../services/contact.service");

const submitContact = asyncHandler(async (req, res) => {
  const inquiry = await contactService.createContact(req.body);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(
      HTTP_STATUS.CREATED,
      { inquiryId: inquiry._id },
      "Thank you for contacting Furalto. We will respond shortly."
    )
  );
});

module.exports = {
  submitContact,
};
