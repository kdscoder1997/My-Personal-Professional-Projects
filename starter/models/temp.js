[
  {
    $match: {
      product: new ObjectId("63ab0cb85d1347240da0ae1f"),
    },
  },
  {
    $group: {
      _id: null,
      averageRating: {
        $avg: "$rating",
      },
      numOfReviews: {
        $sum: 1,
      },
    },
  },
];
