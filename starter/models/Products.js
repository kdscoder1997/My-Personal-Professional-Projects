const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name."],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters."],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Please provide product description."],
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters."],
    },
    image: {
      type: String,
      default: "/uploads/default.jpg",
    },
    category: {
      type: String,
      required: [true, "Please provide product category."],
      enum: ["office", "kitchen", "bedroom"], //array
    },
    company: {
      type: String,
      required: [true, "Please provide product company."],
      enum: {
        //object
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String], //array of multiple
      default: ["#333"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timeStamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

//Mongoose virtuals are computed properties on Mongoose documents. They are not stored in MongoDB: a virtual property is computed whenever you access it. This will let you work logically on your project.
//Attach reviews to products (getsingleproduct)
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

productSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
  next();
});

module.exports = mongoose.model("Product", productSchema);
