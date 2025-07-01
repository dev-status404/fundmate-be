const express = require("express");
const router = express.Router();

const {
   summarize
} = require("../controller/AiChatController");

router.post("/summarize", summarize);

module.exports = router;