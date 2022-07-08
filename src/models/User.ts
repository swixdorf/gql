
import { Model } from 'sequelize';

interface UserProps {
    id: string;
    name: string;
    balance: number;
}

export type {UserProps};


module.exports =  (sequelize: any, DataTypes: any) => {
    class User extends Model<UserProps>
        implements UserProps {

        id!: string;
        name!: string;
        balance!: number;

        static associate(models: any) {

        }
    };
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        balance: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};