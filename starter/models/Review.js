const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating."],
    },
    title: {
      type: String,
      required: [true, "Please provide title"],
      maxlength: [100, "Maximum 100 characters only"],
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      //connecting user to review
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      //connecting product to review
      type: mongoose.Types.ObjectId,
      ref: "Product", //name of schema while creating mongoose.Model
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true }); //1 review per product per user and review should not be same, it should be unique

reviewSchema.statics.calculateAverageRating = async function (productId) {
  //pre hook on schema directly
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          //property in product schema
          $avg: "$rating",
        },
        numOfReviews: {
          //property in product schema
          $sum: 1, //true
        },
      },
    },
  ]);
  // console.log(result]);
  try {
    const res = await this.model("Product").findOneAndUpdate(
      { _id: productId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0), //chain operator of js
        numOfReviews: result[0]?.numOfReviews || 0, //chain operator of js
      }
    );
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};

reviewSchema.post("save", async function () {
  //invokes when save method is triggered
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post("remove", async function () {
  //invokes when save remove is triggered
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
