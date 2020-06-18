let db = {
  screams: [
    {
      uderHandle: "user",
      body: "this is the scream body",
      createdAt: "2020-06-17T07:58:35.070Z",
      likeCount: 5,
      commentCount: 2,
    },

    {
      //...............
    },

    {
      // and so on.................
    },
  ],

  user: [
    {
      userId: "asdlkfjasl;dkfj",
      email: "test1@gmail.com",
      handle: "test1",
      createdAt: "2019-03-15T10:59:52.789Z",
      imageUrl: "imag/.....",
      bio: "my-bio",
      website: "www.facebook.com",
      location: "London,Uk",
    },

    {
      //...............
    },

    {
      // and so on.................
    },
  ],

  comments: [
      {
          userHandle: 'user',
          screamId: 'qepwroiuqweriou',
          body: 'nice one mate!',
          createdAt: 'timestamp',
      },

      {
        //...............
      },
  
      {
        // and so on.................
      },
  ]
};

const userDetails = {
  credentials: {
    userId: "asdlkfjasl;dkfj",
    email: "test1@gmail.com",
    handle: "test1",
    createdAt: "2019-03-15T10:59:52.789Z",
    imageUrl: "imag/.....",
    bio: "my-bio",
    website: "www.facebook.com",
    location: "London,Uk",  
  },
  likes: [
    {
      userHandle: "user",
      screamId: "a;lkjwieruoqikljqewr.,xmcv",
    },
    {
      //...............
    },

    {
      // and so on.................
    },
  ],
};
