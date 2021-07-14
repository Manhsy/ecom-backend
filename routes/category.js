const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");

//add and delete category
router.post("/", async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
      color: req.body.color,
      icon: req.body.icon,
    });

    const result = await newCategory.save();
    if (!result)
      return res.status(404).send({ Error: "error in creating category" });
    return res.send(result);
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id);

    if (!category)
      return res
        .status(404)
        .send({ success: false, message: "failure to remove category" });
    return res.send({
      success: true,
      message: "category successfully deleted",
    });
  } catch (err) {
    res.status(404).send({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    if (!categories)
      return res
        .status(404)
        .send({ success: false, message: "failure to send categories" });
    return res.status(200).send(categories);
  } catch (err) {
    res.status(404).send({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .send({ success: false, message: "cannot find category" });
    return res.status(200).send(category);
  } catch (err) {
    res.status(404).send({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon,
      },
      { new: true }
    );

    if (!category)
      return res
        .status(404)
        .send({ success: false, message: "category failed to update" });
    return res.send(category);
  } catch (err) {
    res.status(404).send({ success: false, message: err.message });
  }
});

module.exports = router;
