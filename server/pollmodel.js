"use strict";

import mongoose from "mongoose";
import random from "mongoose-simple-random";

const pollSchema = new mongoose.Schema({
        details: {
          question: String,
          options: [{}],
          voted: [],
          votes: []
        },
        owner: String
      },
      { timestamps: true });

pollSchema.plugin(random);

export default mongoose.model("Poll", pollSchema);