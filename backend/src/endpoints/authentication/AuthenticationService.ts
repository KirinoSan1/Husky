import { User } from "../user/UserModel"

/**
 * Checks email and password and upon success returns the user's ID and name, with success set to true. 
 * If no user with the given email exists or the password is incorrect, only success is returned as false. 
 */
/* istanbul ignore next */
export async function login(email: string, password: string): Promise<{ success: boolean, id?: string, name?: string, role?: "u" | "a" | "m" }> {
    if (email.length < 6) {
        throw new Error("email is not defined");
    }
    if (!password) {
        throw new Error("password is not defined");
    }
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    // Check if user exists
    if (!user) {
        return { success: false };
    }
    // Check if password is correct
    if (!(await user.isPasswordCorrect(password))) {
        return { success: false };
    }
    if (user.admin) {
        // If admin give role "a"
        return { success: true, id: user.id, name: user.name, role: "a" };
    } else if (user.mod) {
        // If mod give role "m"
        return { success: true, id: user.id, name: user.name, role: "m" };
    } else {
        // If not admin nor mod give role "u" for normal user
        return { success: true, id: user.id, name: user.name, role: "u" };
    }
};
