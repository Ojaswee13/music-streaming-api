const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function registerUser(req, res) {
    try {
        const { username, email, password, role = "user" } = req.body

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExists) {
            return res.status(409).json({ message: "User Already Exists." })
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash,
            role
        })

        const token = jwt.sign({
            id: user._id,
            role: user.role,
        }, process.env.JWT_SECRET)

        res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 })

        res.status(201).json({
            message: "User registered successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong.", error: err.message })
    }
}

async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." })
        }

        const isPasswordvalid = await bcrypt.compare(password, user.password);

        if (!isPasswordvalid) {
            return res.status(401).json({ message: "Invalid credentials." })
        }

        const token = jwt.sign({
            id: user._id,
            role: user.role,
        }, process.env.JWT_SECRET)

        res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 })

        res.status(200).json({
            message: "User logged in successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong.", error: err.message })
    }
}

async function logoutUser(req, res) {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successfully." })
}

module.exports = { registerUser, loginUser, logoutUser };