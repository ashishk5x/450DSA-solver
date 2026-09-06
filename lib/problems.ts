export const EXAMPLE_PROBLEMS = {
  "two-sum": {
    label: "Two Sum",
    content: `1. Two Sum
Easy | Arrays, Hash Table | Asked in Google, Amazon, Meta

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution. You may not use the same element twice.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9, return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Constraints:
2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
Only one valid answer exists.
Follow-up: Can you solve it in less than O(n^2)?`,
  },
  "longest-substring": {
    label: "Longest Substring",
    content: `3. Longest Substring Without Repeating Characters
Medium | String, Sliding Window, Hash Table

Given a string s, find the length of the longest substring without repeating characters.

Example 1:
Input: s = "abcabcbb"
Output: 3

Example 2:
Input: s = "bbbbb"
Output: 1

Constraints:
0 <= s.length <= 5 * 10^4`,
  },
  "climbing-stairs": {
    label: "Climbing Stairs",
    content: `70. Climbing Stairs
Easy | Dynamic Programming

You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?

Example 1:
Input: n = 2
Output: 2

Example 2:
Input: n = 3
Output: 3

Constraints: 1 <= n <= 45`,
  },
  "product-except-self": {
    label: "Product Except Self",
    content: `238. Product of Array Except Self
Medium | Arrays, Prefix Sum | Asked in Amazon, Apple, Google

Given an integer array nums, return an array answer such that answer[i] equals the product of all elements except nums[i]. Must run in O(n) time without division.

Example 1:
Input: nums = [1,2,3,4]
Output: [24,12,8,6]

Constraints:
2 <= nums.length <= 10^5`,
  },
  "valid-parentheses": {
    label: "Valid Parentheses",
    content: `20. Valid Parentheses
Easy | Stack, String | Asked in Google, Facebook, Amazon

Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false

Constraints:
1 <= s.length <= 10^4`,
  },
};
