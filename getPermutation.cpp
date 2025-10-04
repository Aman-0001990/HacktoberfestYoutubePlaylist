class Solution {
public:
    string getPermutation(int n, int k) {
        vector<int> nums;
        int fact = 1;
        
        // Initialize numbers 1 to n and compute n!
        for (int i = 1; i <= n; i++) {
            nums.push_back(i);
            fact *= i;
        }

        k--; // Convert to 0-based index
        string result = "";

        for (int i = 0; i < n; i++) {
            fact = fact / (n - i); // (n - i - 1)!
            int index = k / fact;
            result += to_string(nums[index]);
            nums.erase(nums.begin() + index);
            k = k % fact;
        }

        return result;
    }
};
