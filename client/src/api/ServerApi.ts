import axios from "axios";

// const server = "http://localhost:5050";
const server = "https://youth-baikal.store:5050";

export interface CreateParticipantDto {
  user_name: string;
  first_time: boolean;
}

class ServerApi {
  public async getParticipants() {
    const endpoint = `${server}/participants`;

    try {
      return await axios.get(endpoint);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async getSingleParticipant(userId: string) {
    const endpoint = `${server}/participants/${userId}`;

    try {
      return await axios.get(endpoint);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async createUser(request: CreateParticipantDto) {
    const endpoint = `${server}/participants/create`;

    try {
      return await axios.post(endpoint, request);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async updateParticipant(params: { userId: string; paid: boolean }) {
    const endpoint = `${server}/participants/update/${params.userId}`;

    try {
      const response = await axios.put(endpoint, {
        userId: params.userId,
        paid: params.paid,
        token: localStorage.getItem("token"),
      });
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async admitParticipant(params: { userId: string; datetime: string }) {
    const endpoint = `${server}/participants/admit/${params.userId}`;

    try {
      const response = await axios.put(endpoint, {
        userId: params.userId,
        datetime: params.datetime,
        token: localStorage.getItem("token"),
      });
      return response;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  public async login(params: { login: string; password: string }) {
    const endpoint = `${server}/auth`;

    try {
      const response = await axios.post(endpoint, params);
      console.log(response); // TODO: DELETE DEV LOG
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  public async validateToken(token: string) {
    const endpoint = `${server}/validate`;

    try {
      const response = await axios.post(endpoint, { token: token });
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

export const serverApi = new ServerApi();
