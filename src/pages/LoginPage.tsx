import React, { useState } from 'react';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { useNavigate } from 'react-router-dom';
import '../css/AuthPages.css';
import { useUser } from '../context/UserContext';

// Helper to build SOAP envelope with Credentials header
function buildSoapEnvelope(operation: string, bodyXml: string, username: string, password: string, type: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <Credentials xmlns="http://tempuri.org/soapheaders">
      <Type>${type}</Type>
      <Username>${username}</Username>
      <Password>${password}</Password>
    </Credentials>
  </soap:Header>
  <soap:Body>
  <LoginUser xmlns="http://tempuri.org/" />
  </soap:Body>
</soap:Envelope>`;
}

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = `<username>${username}</username><password>${password}</password>`;
    const soapRequest = buildSoapEnvelope(
      'LoginUser',
      '',
      username,
      password,
      'Login'
    );

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      console.log("URL: " + baseUrl);
      const res = await axios.post(
        `${baseUrl}/ReservationService`,
        soapRequest,
        {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'http://tempuri.org/IReservationService/LoginUser'
          }
        }
      );
      const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '',
                removeNSPrefix: true
              });
      const json = parser.parse(res.data);
      const operationStatus = json.Envelope?.Header?.OperationStatus;
      console.log('OS:', operationStatus);
      if (operationStatus === "Success") {
        setMessage('Logowanie zakończone sukcesem!');
        login(username);
        console.log('OS2:', operationStatus);
        navigate('/');
      } else {
        setMessage('Logowanie nie powiodło się. Dane mogą być błędne.');
      }
    } catch {
      setMessage('Błąd podczas logowania.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Logowanie</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Login"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p className="info">{message}</p>}
      </div>
    </div>
  );
};

export default LoginPage;