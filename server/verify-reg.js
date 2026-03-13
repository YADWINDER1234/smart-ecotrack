
async function testRegister() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Verification User',
                email: 'verify' + Date.now() + '@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Registration Success:', data.user);
            process.exit(0);
        } else {
            console.error('Registration Failed:', data);
            process.exit(1);
        }
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

testRegister();
