import { MongooseError, Types } from "mongoose";
import { IUser, User,  IUserMethods} from "../../src/endpoints/user/UserModel";
import TestDB from "../TestDB";
import { compare } from "bcryptjs";
//https://gitlab.bht-berlin.de/we2-23ss/su/we1.su01.mongoose/-/blob/main/tests/model/UserModel.test.ts
//von Ihnen inspiriert teilweise

let umut: IUser & {_id: Types.ObjectId;}
beforeAll(async()=> await TestDB.connect())
beforeEach(async()=>{
    umut = await User.create({
        email:"umutcandin@gmx.de", name: "Umut Can Aydin", password: "umut21", admin: false
    })
})
afterEach(async()=> await TestDB.clear())
afterAll(async()=> await TestDB.close())

test("Tester Name", async()=>{
    const habub = await User.create({
        email:"umutcanaydin@gmx.de", name: "Habub", password: "umut21", admin: false
    })
    const habub2 = await habub.save()
    
    expect(habub2).toBeDefined()
    expect(umut.name).not.toEqual(habub2.name)
    habub2.name = "Umut Can Aydin"
    expect(umut.name).toEqual(habub2.name)
})
test("Tester Password", async()=>{
    const habub = await User.create({
        email:"umutcanaydin@gmx.de", name: "Habub", password: "umut21", admin: false
    })
    const habub2 = await habub.save()
    expect(habub2).toBeDefined()
    expect(umut.password).not.toEqual(habub2.password)
    habub2.password = "hallo"
    expect(umut.password).not.toEqual(habub2.password)

})
//NEUER TEST
test("Tester Password", async()=>{
    const habub = await User.create({
        email:"umutcanaydin@gmx.de", name: "Habub", password: "umut21", admin: false
    })
    //const habub2 = await habub.save()
    expect(habub).toBeDefined()
    expect(umut.password).not.toEqual(habub.password)
    //habub.password = "hallo"
    expect((await habub.isPasswordCorrect(habub.password))).not.toEqual(umut.password)
    habub.password = "hallo"
    await expect((habub.isPasswordCorrect(habub.password))).rejects.toThrow()
    

})

test("Tester admin", async()=>{
    const habub = await User.create({
        email:"umutcandinss@gmx.de", name: "Habub", password: "umut21", admin: true
    })
    const habub2 = await habub.save()
    expect(habub2).toBeDefined()
    expect(umut.admin).toBe(false)
    expect(habub2.admin).toBe(true)
    expect(habub2.admin).not.toEqual(umut.admin)
    habub2.admin = false
    expect(habub2.admin).toEqual(umut.admin)
})
test("Tester email", async()=>{
    const habub = await User.create({
        email:"umutcandinss@gmx.de", name: "Habub", password: "umut21", admin: false
    })
    const habub2 = await habub.save()
    expect(habub2).toBeDefined()
    expect(umut.email).not.toBe(habub2.email)
})

test("Tester add", async()=>{
    const habub = await User.create({
        email: "umi@gg.de", name: "Umi", password: "12", admin: true
        
    })
    const habub2 = await habub.save()
    expect(habub2).toBeDefined()
    expect(habub2.id).toBeDefined()
    expect(habub2.name).toBe("Umi")
    expect(habub2.name).not.toEqual(umut.name)
})
test("Tester add", async()=>{
    const habub = new User({
        email: "umi@gg.de", name: "Umiti", password: "12", admin: true
        
    })
    const habub2 = await habub.save()
    expect(habub2).toBeDefined()
    const updated = await User.updateOne({
        email: "umi@gg.de"}, {name: "HABEBE"})
    expect(updated.acknowledged).toBeTruthy()
    expect(updated.modifiedCount).toBe(1)

    const habub3 = await User.findOne({email: "umi@gg.de"}).exec()
    if(habub3){
        expect(habub3.name).toBe("HABEBE")
    }
})
test("Tester is email unique", async()=>{
    const habub = new User({
        email: "umi@gg.de", name: "Umiti", password: "12", admin: true
        
    })
    const habubsave = await habub.save()
    expect(habubsave).toBeDefined()
    
    const habub2 = new  User({
        email: "umi@gg.de", name: "Umti", password: "122", admin: true
    })
    try{
        await habub2.save()
        const habubsave2 = await habub2.save()
        expect(habubsave2).toBeDefined()
    }catch{
        
    }
})
test("Tester boolean", async()=>{
    const habub = new User({
        email: "umit@gg.de", name: "Umi", password: "12", admin: true
        
    })
    const habub2 = await habub.save()
    expect(habub2).toBeDefined()
    expect(habub2.id).toBeDefined()
    expect(habub2.name).toBe("Umi")
    expect(habub2.admin).toBe(true)

    const hab = new  User({
        password: "122", admin: true
    })
    expect(hab.name).toBeUndefined()
    expect(hab.email).toBeUndefined()
})
test("Tester required", async()=>{
    const habub = new User({
        email: "umit@gg.de", password: "12", admin: true
    })
   expect(async()=> await habub.save()).rejects.toThrow()
})

