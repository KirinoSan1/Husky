import { User } from "../user/UserModel"

/**
 * Checks email and password and upon success returns the user's id and name, with success set to true. 
 * If no user with the given email exists or the password is incorrect, only success is returned as false. 
 */
export async function login(email: string, password: string): Promise<{ success: boolean, id?: string, name?: string, role?: "u" | "a" | "m" }> {
    if (email.length < 6) {
        throw new Error("email is not defined")
    }
    if (!password) {
        throw new Error("password is not defined")
    }
    const user = await User.findOne({ email: email.toLowerCase() }).exec()
    //check if user exists
    if (!user) {
        return { success: false }
    }
    //check if password is correct
    if (!(await user.isPasswordCorrect(password))) {
        return { success: false }
    }
    if (user.admin) {
        //if admin give role "a"
        // console.log( "wird zurückgegeben: " + JSON.stringify({ success: true, id: user.id, name: user.name, role: "a" }));
        return { success: true, id: user.id, name: user.name, role: "a" }
    } else if (user.mod) {
        //if mod give role "m"
        return { success: true, id: user.id, name: user.name, role: "m" }
    } else {
        //if not admin nor mod give role "u" for normal user
        return { success: true, id: user.id, name: user.name, role: "u" }
    }
}