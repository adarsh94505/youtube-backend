import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';


const registerUser = asyncHandler(  async (req, res) => {
    
    // 🔍 Step 1: Debug input (for development only)
    console.log("🟡 req.body:", req.body);
    console.log("🔵 req.files:", req.files);

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // 🧾 Step 2: Extract fields from request
    const {fullName, email, username , password } = req.body
    //console.log("email: ", email);

      // ✅ Step 3: Validate required fields
     if ([fullName, email, username, password].some(field => field?.trim() === "")) {
         throw new ApiError(400, "All fields are required");
     }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    // 🔍 Step 4: Check if user already exists (by email or username)
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    console.log("Existing user check result: ", existedUser);
    //console.log(req.files);


    // 🖼️ Step 5: Prepare avatar and cover image paths from multer

    //const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
    avatarLocalPath = req.files.avatar[0].path;
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // ☁️ Step 6: Upload files to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   
    // 🛠️ Step 7: Create user in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username
    })

    // 🧹 Step 8: Sanitize output (remove password, token)
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // 📤 Step 9: Return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

export {registerUser}