const express = require("express");
const router = express.Router();

const {createWorkspace,addUserInWorkspace}=require("../controllers/workSpaceController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("",authMiddleware,createWorkspace)
router.post("/:workspaceId/members",authMiddleware,addUserInWorkspace)


module.exports=router