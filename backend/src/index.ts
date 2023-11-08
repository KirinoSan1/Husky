import express from 'express';
import { connect, disconnect } from "./database/database";

const app = express();

// Anknüpfung mit der Datenbank
connect();