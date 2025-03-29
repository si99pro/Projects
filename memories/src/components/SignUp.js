// src/components/SignUp.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase'; // Import Firebase auth and db
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'; //Import react-bootstrap components
import 'bootstrap/dist/css/bootstrap.min.css'; //Import Bootstrap CSS

function SignUp() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const [session, setSession] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [timeLeft, setTimeLeft] = useState(30); //Initial time left
    const navigate = useNavigate();

    const resendTimerRef = useRef(null);

    // Function to get batch based on Student ID
    const getBatchFromStudentId = (studentId) => {
        if (studentId.length === 7 && studentId.startsWith('16')) {
            return '2016';
        } else if (studentId.length === 7 && studentId.startsWith('17')) {
            return '2017';
        } else if (studentId.length === 7 && studentId.startsWith('18')) {
            return '2018';
        } else if (studentId.length === 7 && studentId.startsWith('19')) {
            return '2019';
        } else if (studentId.length === 7 && studentId.startsWith('20')) {
            return '2020';
        } else if (studentId.length === 7 && studentId.startsWith('21')) {
            return '2021';
        } else if (studentId.length === 7 && studentId.startsWith('22')) {
            return '2022';
        } else if (studentId.length === 7 && studentId.startsWith('23')) {
            return '2023';
        } else if (studentId.length === 7 && studentId.startsWith('24')) {
            return '2024';
        } else if (studentId.length === 7 && studentId.startsWith('25')) {
            return '2025';
        } else {
            return null;
        }
    };

    useEffect(() => {
        //Check auth state on mount
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                //User is signed in
                if (user.emailVerified) {
                    //If email verified, redirect
                    const userRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        if (!userData.userType) {
                            navigate('/');
                        } else {
                            navigate('/'); // Or your dashboard route
                        }
                    } else {
                        console.warn("User document not found. Redirecting to signup.");
                        navigate('/signup')
                    }
                } else {
                    //If email not verified, show verification message and start timer
                    setVerificationSent(true);
                    startResendTimer();
                }
            } else {
                //User is signed out.
                setVerificationSent(false); //Clear verification state.
            }
        });

        return () => {
            unsubscribe(); // Clean up the subscription
            clearInterval(resendTimerRef.current); // Clear timer on unmount
        };
    }, [navigate]);

    // Function to start the resend timer
    const startResendTimer = () => {
        setTimeLeft(30);
        setResendDisabled(true); //Disable the button

        resendTimerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(resendTimerRef.current);
                    setResendDisabled(false);
                    return 0;
                } else {
                    return prevTime - 1;
                }
            });
        }, 1000);
    };

    // useEffect to manage the timer and check verification status
    useEffect(() => {
        if (timeLeft <= 0) {
            setResendDisabled(false);
        }

        const intervalId = setInterval(async () => {
            if (auth.currentUser) {
                await auth.currentUser.reload(); // Refresh user object
                if (auth.currentUser.emailVerified) {
                    clearInterval(intervalId); // Clear polling interval
                    clearInterval(resendTimerRef.current); //clear counter
                    const userRef = doc(db, "users", auth.currentUser.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        if (!userData.userType) {
                            navigate('/user-type');
                        } else {
                            navigate('/'); // Or your dashboard route
                        }
                    } else {
                        console.warn("User document not found. Redirecting to signup.");
                        navigate('/signup');
                    }
                }
            }
        }, 2000); // Check every 2 seconds

        return () => {
            clearInterval(intervalId);
        };
    }, [timeLeft, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (studentId.length !== 7) {
            setError("Error: Student ID must be 7 digits.");
            setSuccessMessage("");
            return;
        }

        const batch = getBatchFromStudentId(studentId);

        if (!batch) {
            setError("Error: Could not determine batch from Student ID.  ID must start with 16, 17, 18, 19, 20, 21, 22, 23, 24 or 25");
            setSuccessMessage("");
            return;
        }

        // Validation: First two digits of Student ID >= Last two digits of Session
        const studentIdPrefix = parseInt(studentId.substring(0, 2));
        const sessionSuffix = parseInt(session.substring(2, 4));

        if (studentIdPrefix > sessionSuffix) {
            setError("Error: Make sure that you have type correct ID and Session.");
            setSuccessMessage("");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);

            const userData = {
                fullName: fullName,
                email: email,
                studentId: studentId,
                batch: batch,
                session: session,
            };

            await setDoc(doc(db, "users", user.uid), userData);
            setVerificationSent(true); //Update state for verification email sent.
            startResendTimer();

        } catch (err) {
            setError(err.message);
        }
    };

    const handleResendVerification = async () => {
        const user = auth.currentUser;

        if (user) {
            try {
                await sendEmailVerification(user);
                setSuccessMessage("A new verification link is sent to " + user.email + ".");
                setError("");
                startResendTimer();
            } catch (err) {
                setError("Error resending verification email: " + err.message);
                setSuccessMessage("");
            }
        } else {
            setError("No user signed in. Please sign up first.");
            setSuccessMessage("");
        }
    };

    const handleResignup = async () => {
        const user = auth.currentUser;

        if (user) {
            try {
                await user.delete();
                navigate('/signup');
            } catch (error) {
                setError('Error deleting user:' + error);
            }
        } else {
            console.warn('No user signed in.');
            navigate('/signup')
        }

    };

    // CSS Styles (Move CSS from HTML to JS)
    const containerStyle = {
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px',
    };

    const buttonStyle = {
        width: '100%',
        marginTop: '15px' // Add margin-top to the button
    };

    return (
        <div className="container" style={containerStyle}>
            {verificationSent ? (
                <Card>
                    <Card.Body>
                        <Alert variant="info">
                            <p>Check your inbox to verify your email address.</p>
                        </Alert>
                        <Button
                            variant="secondary"
                            onClick={handleResendVerification}
                            disabled={resendDisabled}
                        >
                            Resend Verification Email ({timeLeft})
                        </Button>
                        {successMessage && <Alert variant="success">{successMessage}</Alert>}
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Button variant="link" onClick={handleResignup}>Sign up again</Button>

                    </Card.Body>
                </Card>
            ) : (
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Create Account</h2>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {successMessage && <Alert variant="success">{successMessage}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="fullName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group id="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Row>
                                <Col>
                                    <Form.Group id="studentId">
                                        <Form.Label>Student ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group id="session">
                                        <Form.Label>Session</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={session}
                                            onChange={(e) => setSession(e.target.value)}
                                            required>
                                            <option value="">Session</option>
                                            <option value="2016">2016</option>
                                            <option value="2017">2017</option>
                                            <option value="2018">2018</option>
                                            <option value="2019">2019</option>
                                            <option value="2020">2020</option>
                                            <option value="2021">2021</option>
                                            <option value="2022">2022</option>
                                            <option value="2023">2023</option>
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group id="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button style={buttonStyle} type="submit">
                                Sign Up
                            </Button>
                        </Form>
                        <div className="w-100 text-center mt-2">
                            Already have an account? <Link to="/login">Log In</Link>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
}

export default SignUp;