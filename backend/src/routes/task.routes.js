const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { protect, authorize } = require("../middlewares/auth");
const task = require("../controllers/task.controller");

router.use(protect);

router.get("/", task.getMyTasks);

router.post(
  "/",
  [
    body("title").isString().isLength({ min: 1, max: 120 }),
    body("description").optional().isString().isLength({ max: 500 }),
    body("status").optional().isIn(["todo", "doing", "done"]),
  ],
  validate,
  task.createTask
);

router.put("/:id", task.updateMyTask);
router.delete("/:id", task.deleteMyTask);

router.get("/admin/all", authorize("admin"), task.adminGetAllTasks);

module.exports = router;
