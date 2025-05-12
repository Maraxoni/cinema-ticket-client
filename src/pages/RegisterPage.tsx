import React, { useState } from 'react';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { useNavigate } from 'react-router-dom';
import '../css/AuthPages.css';

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
  <RegisterUser xmlns="http://tempuri.org/" />
  </soap:Body>
</soap:Envelope>`;
}

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = `<username>${username}</username><password>${password}</password>`;
    const soapRequest = buildSoapEnvelope(
      'RegisterUser',
      '',
      username,
      password,
      'Registration'
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
            'SOAPAction': 'http://tempuri.org/IReservationService/RegisterUser'
          }
        }
      );
      const parser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: '',
                removeNSPrefix: true
              });
      const json = parser.parse(res.data);
      const result = json.Envelope.Body.RegisterUserResponse?.RegisterUserResult;
      const operationStatus = json.Envelope?.Header?.OperationStatus;
      console.log('OS:', operationStatus);
      if (operationStatus === 'Success') {
        setMessage('Registeration successful!');
        navigate('/Login');
      } else {
        setMessage('Registeration failed. User can already exist.');
      }
    } catch {
      setMessage('Error during registration.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Rejestracja</h2>
        <form onSubmit={handleRegister}>
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
          <button type="submit">Zarejestruj</button>
        </form>
        {message && <p className="info">{message}</p>}
      </div>
    </div>
  );
};

export default RegisterPage;
