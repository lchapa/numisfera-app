package com.numisfera.api.controller;

import com.numisfera.api.model.Coin;
import com.numisfera.api.service.CoinService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(CoinController.class)
public class CoinControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CoinService coinService;

    private Coin coin1;
    private Coin coin2;

    @BeforeEach
    public void setup() {
        coin1 = new Coin(1L, "Centenario", "Mexico", 1921, "Gold", "Desc", "MS-62", "url1");
        coin2 = new Coin(2L, "Morgan", "USA", 1881, "Silver", "Desc", "MS-64", "url2");
    }

    @Test
    public void testGetAllCoins() throws Exception {
        given(coinService.getAllCoins()).willReturn(Arrays.asList(coin1, coin2));

        mockMvc.perform(get("/api/coins")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Centenario")))
                .andExpect(jsonPath("$[1].name", is("Morgan")));
    }

    @Test
    public void testGetCoinById_Found() throws Exception {
        given(coinService.getCoinById(1L)).willReturn(Optional.of(coin1));

        mockMvc.perform(get("/api/coins/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Centenario")))
                .andExpect(jsonPath("$.country", is("Mexico")));
    }

    @Test
    public void testGetCoinById_NotFound() throws Exception {
        given(coinService.getCoinById(99L)).willReturn(Optional.empty());

        mockMvc.perform(get("/api/coins/99")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testCreateCoin() throws Exception {
        given(coinService.createCoin(any(Coin.class))).willReturn(coin1);

        ObjectMapper mapper = new ObjectMapper();
        String coinJson = mapper.writeValueAsString(coin1);

        mockMvc.perform(post("/api/coins")
                .contentType(MediaType.APPLICATION_JSON)
                .content(coinJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Centenario")));
    }

    @Test
    public void testUpdateCoin() throws Exception {
        given(coinService.updateCoin(anyLong(), any(Coin.class))).willReturn(Optional.of(coin1));

        ObjectMapper mapper = new ObjectMapper();
        String coinJson = mapper.writeValueAsString(coin1);

        mockMvc.perform(put("/api/coins/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(coinJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Centenario")));
    }

    @Test
    public void testDeleteCoin_Success() throws Exception {
        given(coinService.deleteCoin(1L)).willReturn(true);

        mockMvc.perform(delete("/api/coins/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    public void testDeleteCoin_NotFound() throws Exception {
        given(coinService.deleteCoin(99L)).willReturn(false);

        mockMvc.perform(delete("/api/coins/99")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
