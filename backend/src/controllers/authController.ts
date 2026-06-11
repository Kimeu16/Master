import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import pool from '../database/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

let transporter: nodemailer.Transporter;

const setupTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log("SMTP configured for real email delivery via", process.env.SMTP_HOST);
  } else {
    // Fallback to testing account
    const account = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass }
    });
    console.log("Ethereal Email account created for testing. No real emails will be sent.");
  }
};

setupTransporter();

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE user_name = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ no: user.no, role: user.rbac_role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      const user = rows[0];
      const resetToken = crypto.randomUUID();
      const expires = Date.now() + 15 * 60 * 1000; // 15 mins

      await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE no = ?', [resetToken, expires, user.no]);

      const origin = req.headers.origin || 'http://localhost:8080';
      const resetUrl = `${origin}/reset-password?token=${resetToken}`;
      
      const fromAddress = process.env.SMTP_FROM || '"AlanDick Ops" <noreply@alandick.com>';
      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click here to reset your password: ${resetUrl}`,
        html: `<p>You requested a password reset. <a href="${resetUrl}">Click here to reset your password</a></p>`
      });

      if (!process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
    }
    
    // Always return generic response
    res.json({ message: 'If that email matches an account in our system, a recovery link has been sent.' });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?', [token, Date.now()]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = rows[0];
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE no = ?', [hash, user.no]);

    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

