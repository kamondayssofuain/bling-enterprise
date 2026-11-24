import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
const required=['MPESA_CONSUMER_KEY','MPESA_CONSUMER_SECRET','MPESA_SHORTCODE','MPESA_PASSKEY','MPESA_CALLBACK_URL'];
const base=process.env.MPESA_ENV==='production'?'https://api.safaricom.co.ke':'https://sandbox.safaricom.co.ke';
const timestamp=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0'),String(d.getHours()).padStart(2,'0'),String(d.getMinutes()).padStart(2,'0'),String(d.getSeconds()).padStart(2,'0')].join('')};
async function accessToken(){const auth=Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');const r=await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`,{headers:{Authorization:`Basic ${auth}`}});const j=await r.json();if(!r.ok)throw new Error(j.errorMessage||'Daraja authentication failed');return j.access_token;}
app.post('/api/mpesa/stk-push',async(req,res)=>{try{const missing=required.filter(k=>!process.env[k]);if(missing.length)return res.status(503).json({error:`M-Pesa setup incomplete: ${missing.join(', ')}.`});const {phone,amount,accountReference='BLING',description='Bling Enterprise order'}=req.body||{};if(!/^2547\d{8}$/.test(String(phone||'')))return res.status(400).json({error:'Phone must be in 2547XXXXXXXX format.'});const amt=Math.round(Number(amount));if(!Number.isFinite(amt)||amt<1)return res.status(400).json({error:'Invalid payment amount.'});const ts=timestamp();const password=Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${ts}`).toString('base64');const token=await accessToken();const payload={BusinessShortCode:process.env.MPESA_SHORTCODE,Password:password,Timestamp:ts,TransactionType:process.env.MPESA_TRANSACTION_TYPE||'CustomerPayBillOnline',Amount:amt,PartyA:phone,PartyB:process.env.MPESA_SHORTCODE,PhoneNumber:phone,CallBackURL:process.env.MPESA_CALLBACK_URL,AccountReference:String(accountReference).slice(0,12),TransactionDesc:String(description).slice(0,13)};const r=await fetch(`${base}/mpesa/stkpush/v1/processrequest`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok||data.ResponseCode!=='0')return res.status(502).json({error:data.errorMessage||data.ResponseDescription||'Daraja rejected the STK Push request.'});res.json(data);}catch(e){console.error(e);res.status(500).json({error:'Unable to initiate M-Pesa payment.'})}});
app.post('/api/mpesa/callback',(req,res)=>{console.log('M-Pesa callback received:',JSON.stringify(req.body));/* TODO: verify and persist callback result/order status in a database before fulfilling orders. */res.json({ResultCode:0,ResultDesc:'Accepted'});});
const __dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname,'../dist')));
app.get('*',(req,res)=>res.sendFile(path.resolve(__dirname,'../dist/index.html')));
const port=process.env.PORT||3000;app.listen(port,()=>console.log(`Bling Enterprise server listening on ${port}`));
