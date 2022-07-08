import db from './models'
import { buildSchema } from "graphql"
import express from "express"
import { graphqlHTTP } from "express-graphql"
import { UserProps } from './models/User';
import { BetProps } from './models/Bet';

const schema = buildSchema(`
    input UserInput {
        email: String!
        name: String!

    }

    type User {
        id: Int!
        name: String!
        balance: String!
    }

    type Bet {
        id: Int!
        userId: Int!
        betAmount: Float!
        chance: Float!
        payout: Float!
        win: Boolean!
    }

    type Mutation {
        createBet(userId: Int, betAmount: Float, chance: Float): Bet
    }

    type Query {
        getUser(id: Int): User
        getUserList: [User]
        getBet(id: Int): Bet
        getBetList: [Bet]
        getBestBetPerUser(limit: Int): [Bet]
    }

`);

const getUser = (args: { id: number }): UserProps | undefined => db.User.findOne({ attributes: { raw: true }, where: { id: args.id } })
const getUserList = (): UserProps[] => db.User.findAll({ attributes: { raw: true } });
const getBet = (args: { id: number }): BetProps | undefined => db.Bet.findOne({ attributes: { raw: true }, where: { id: args.id } })
const getBetList = (): BetProps[] => db.Bet.findAll({ attributes: { raw: true } });
const getBestBetPerUser = async (args: { limit: number }): Promise<BetProps[]> => {
    //pagination can implement
    const userIds = await db.Bet.findAll(
        {
            attributes: [
                [db.seq.literal('DISTINCT `userId`'), 'userId']
            ],
            order: [['betAmount', 'DESC']],
            limit: args.limit,
            raw: true
        }
    );
    let result = [];
    for (let i = 0; i < userIds.length; i++) {
        result.push(await db.Bet.findOne({ where: { userId: userIds[i].userId }, order: [['betAmount', 'DESC']], raw: true }));
    }
    return result;
};

const createBet = async (args: { userId: number, betAmount: number, chance: number }): Promise<BetProps> => {
    if (args.chance >= 100)
        throw new Error('FRAUD');
    var user = await db.User.findOne({ attributes: { raw: true }, where: { id: args.userId } })
    if (user) {
        if (user.balance > args.betAmount) {
            console.log(user.balance);
            const newBalance = user.balance - args.betAmount;
            await db.User.update({ balance: newBalance }, { where: { id: user.id } });
            user = await db.User.findOne({ attributes: { raw: true }, where: { id: args.userId } });
            // need to implement mutex for multiple spend preventation.
            if (user.balance != newBalance) {
                throw new Error('balance error');
            }
            const roll = Math.random() * 100
            const win = roll < args.chance;
            const payout = win ? args.betAmount * (100 / args.chance) : 0;
            if(win)
            {
                user.increment({balance:payout},{where:{id:user.id}});
            }
            const bet = await db.Bet.create({ userId: args.userId, betAmount: args.betAmount, chance: args.chance, payout, win });
            return bet;
        }
        else
            throw new Error('Insufficient Balance');

    }
    else {
        throw new Error('User Not Found');
    }
}

const root = {
    getUser,
    getUserList,
    getBet,
    getBetList,
    getBestBetPerUser,
    createBet
};

(async () => {
    await db.Bet.sync();
    await db.User.sync();
    await db.Bet.findAll();

    await db.User.create({ name: "User1", balance: Math.random() * 10000 });
    await db.User.create({ name: "User2", balance: Math.random() * 10000 });
    await db.Bet.create({ userId: 1, betAmount: 1000, chance: 0.2, payout: 0, win: false });
    await db.Bet.create({ userId: 1, betAmount: 2200, chance: 0.22, payout: 0, win: false });
    await db.Bet.create({ userId: 2, betAmount: 5000, chance: 0.22, payout: 0, win: false });



    const app = express()

    app.use(
        "/graphql",
        graphqlHTTP({
            schema: schema,
            rootValue: root,
            graphiql: true,
        })
    )
    const PORT = 9000

    app.listen(PORT)

    console.log(`Running http://localhost:${PORT}/graphql`);

})();

console.log(db);