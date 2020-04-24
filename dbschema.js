let db = {
    users: [
        {
            userId: 'skdjasd8sad8saudjw8e2d',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2020-04-20T08:56:26.176Z',
            imageUrl: 'image/sadkdaskdsakdlk',
            bio: 'Hello, my name is user, nice to meet you',
            website: 'https://user.com',
            location: 'London, UK'
        }
    ],
    screams: [
        {
            userHandle: 'user',
            body: 'this is the scream body',
            createdAt: '2020-04-20T08:56:26.176Z',
            likedCount: 5,
            commentCount: 2
        }
    ],
    comments: [
        {
            userHandle: 'user',
            screamId: 'ksad232jj2320x2s',
            body: 'nice one master',
            createdAt: '2020-04-20T08:56:26.176Z',
        }
    ]
};
const userDetails = {
    // Redux data
    credentials: {
        userId: 'KJSDJSD934e93SJSJJJJ',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2020-04-20T08:56:26.176Z',
        imageUrl: 'image/sadkdaskdsakdlk',
        bio: 'Hello, my name is user, nice to meet you',
        website: 'https://user.com',
        location: 'London, UK'
    },
    likes: [
        {
            userHandle: 'user',
            screamId: `jsd983228328sjd`
        },
        {
            userHandle: 'user',
            screamId: `k2392j282jskd`
        }
    ]
};