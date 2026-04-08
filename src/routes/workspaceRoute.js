const express = require("express");
const router = express.Router();

const {createWorkspace,addUserInWorkspace}=require("../controllers/workSpaceController")

router.post("/workspaces",createWorkspace)
router.post("/workspaces/:workspaceId/members",addUserInWorkspace)


module.exports=router