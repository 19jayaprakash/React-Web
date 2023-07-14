const express = require('express');
const router = express.Router();
const bcrypte = require('bcryptjs');
const auth = require("../middleware/auth");
const jwtToken = require('jsonwebtoken');
const { check, validationResult } = require("express-validator");

const userModel = require("../models/user");

router.post("/",
    check("email", "email is required").isEmail(),
    check("password", "password is required").exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;

        try {

            let user = await userModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ msg: "Invalid credentials" });
            }

            const isMatch = await bcrypte.compare(password, user.password);

            if (!isMatch) {
                return res.status(404).json({ msg: "Invalid credentials" });
            }

            const payload = { user: { id: user.id } };
            jwtToken.sign(payload, "jwtSecret", { expiresIn: "5 days" }, (err, token) => {
                if (err) throw err;
                else
                    res.json(token);
            })
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    });

router.get("/", auth, async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;