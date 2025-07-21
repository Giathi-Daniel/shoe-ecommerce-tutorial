exports.handleFailedLogin = async (user) => {
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 10 * 60 * 1000

    user.loginAttempts += 1

    if(user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME
        user.loginAttempts = 0;
    }

    await user.save()
}

exports.resetLoginAttempts = async (user) => {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save()
}