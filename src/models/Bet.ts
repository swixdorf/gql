
import { Model } from 'sequelize';
//Bet (id: int, userId: int, betAmount: float, chance: float, payout: float, win: boolean)
interface BetProps {
    id: string;
    userId: number;
    betAmount: number;
    chance: number;
    payout: number;
    win: boolean
}

export type {BetProps};

module.exports =  (sequelize: any, DataTypes: any) => {
    class Bet extends Model<BetProps>
        implements BetProps {

        id!: string;
        userId!: number;
        betAmount!: number;
        chance!: number;
        payout!: number;
        win!: boolean;

        static associate(models: any) {

        }
    };
    Bet.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        betAmount: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        chance: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        payout: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        win: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Bet',
    });
    return Bet;
};