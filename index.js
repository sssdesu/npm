import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

let client;

/**
 * Initializes the DynamoDB client for cute-dynamo library usage. It configures the client based on the environment and credentials provided.
 * This function supports two authentication methods:
 * 1. Client-side authentication using an AWS Identity Pool ID for applications where AWS credentials are managed client-side.
 * 2. Server-side authentication using AWS Access Key ID and AWS Secret Access Key for server-side applications.
 *
 * By adhering to cute-dynamo's minimalistic design, this initialization sets the stage for interacting with DynamoDB tables that conform to the specified naming conventions and data structure rules.
 *
 * @param {Object} options - Configuration options for the DynamoDB client. Includes region, identityPoolId, accessKeyId, and secretAccessKey.
 * @param {string} [options.region=process.env.AWS_REGION] - The AWS region where the DynamoDB instance is hosted.
 * @param {string} [options.identityPoolId=process.env.AWS_IDENTITY_POOL_ID] - The AWS Cognito Identity Pool ID for client-side authentication. Optional if server-side credentials are provided.
 * @param {string} [options.accessKeyId=process.env.AWS_ACCESS_KEY_ID] - The AWS Access Key ID for server-side authentication. Required if not using client-side authentication with an Identity Pool ID.
 * @param {string} [options.secretAccessKey=process.env.AWS_SECRET_ACCESS_KEY] - The AWS Secret Access Key for server-side authentication. Required if not using client-side authentication.
 *
 * @throws {Error} Throws an error if insufficient credentials are provided for either authentication method.
 *
 * @example
 * // Initialize for server-side usage or client-side with an identity pool ID
 * // Server-side reads env vars: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 * // Client-side reads env vars: AWS_REGION, AWS_IDENTITY_POOL_ID,
 * await init();
 *
 * @example
 * // Initialize for client-side usage with an identity pool ID
 * await init({ region: 'us-east-1', identityPoolId: 'us-east-1:exampleId' });
 *
 * @example
 * // Initialize for server-side usage with access key and secret key
 * await init({ region: 'us-east-1', accessKeyId: 'AKIAEXAMPLE', secretAccessKey: 'secret' });
 */
export async function init({
    region = typeof process !== 'undefined' ? process.env.AWS_REGION : undefined,
    identityPoolId = typeof process !== 'undefined' ? process.env.AWS_IDENTITY_POOL_ID : undefined,
    accessKeyId = typeof process !== 'undefined' ? process.env.AWS_ACCESS_KEY_ID : undefined,
    secretAccessKey = typeof process !== 'undefined' ? process.env.AWS_SECRET_ACCESS_KEY : undefined
} = {}) {
    let credentials;

    if (identityPoolId) {
        const {CognitoIdentityClient} = await import("@aws-sdk/client-cognito-identity");
        const {fromCognitoIdentityPool} = await import("@aws-sdk/credential-provider-cognito-identity");
        credentials = fromCognitoIdentityPool({
            client: new CognitoIdentityClient({region}),
            identityPoolId,
        });
    } else if (accessKeyId && secretAccessKey) {
        credentials = {
            accessKeyId,
            secretAccessKey
        };
    } else {
        throw new Error("Insufficient credentials provided");
    }

    client = DynamoDBDocumentClient.from(new DynamoDBClient({region, credentials}));
}

/**
 * Creates a DynamoDB table instance for performing operations on items.
 *
 * @param {string} [tablename] - The name of the DynamoDB table. If not provided, the value of the `DYNAMODB_TABLE` environment variable is used.
 * @returns {Object} An object with an `at` method for specifying the primary key and sort key of an item.
 *
 * @example
 * const item = await table('yourtablename').at({'yourPKkeyName': 'PKvalue', 'yourSKname': 1711900504}).get();
 */
export const table = (tablename) => {
    const tableObject = {
        at: (PKorPKSK) => {
            const atObject = {
                get: async () => {
                    const {GetCommand} = await import("@aws-sdk/lib-dynamodb");
                    const response = await client.send(new GetCommand({
                        TableName: tablename || (typeof process !== 'undefined' ? process.env.DYNAMODB_TABLE : undefined),
                        Key: PKorPKSK,
                    }));
                    return response.Item && response.Item.JSON ? JSON.parse(response.Item.JSON) : response.Item || null;
                },
                put: async (data) => {
                    const {PutCommand} = await import("@aws-sdk/lib-dynamodb");
                    return await client.send(new PutCommand({
                        TableName: tablename || (typeof process !== 'undefined' ? process.env.DYNAMODB_TABLE : undefined),
                        Item: {
                            ...PKorPKSK,
                            JSON: JSON.stringify(data),
                        },
                    }));
                }
            };
            return atObject;
        }
    };
    return tableObject;
};
